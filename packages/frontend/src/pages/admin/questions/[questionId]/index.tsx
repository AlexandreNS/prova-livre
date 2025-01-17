import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import Html from '@prova-livre/frontend/components/Html';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { QuestionType, QuestionTypeString } from '@prova-livre/shared/constants/QuestionType';
import {
  type QuestionCategoriesListSchema,
  QuestionGetSchema,
  QuestionOptionsListSchema,
} from '@prova-livre/shared/dtos/admin/question/question.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { Text } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const questionId = useIdParam('questionId');

  const [hasReadPermission] = hasPermissionList(user?.role, 'Question-Read');

  const { data: question, state } = useRequest<SchemaRoute<typeof QuestionGetSchema>>(
    hasReadPermission && questionId && `/questions/${questionId}`,
  );

  const { data: options, state: optionsState } = useRequest<SchemaRoute<typeof QuestionOptionsListSchema>>(
    hasReadPermission && questionId && question?.type === QuestionType.OPTIONS && `/questions/${questionId}/options`,
  );

  const { data: categories, state: categoriesState } = useRequest<SchemaRoute<typeof QuestionCategoriesListSchema>>(
    hasReadPermission && questionId && `/questions/${questionId}/categories`,
  );

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <State {...state}>
        {question && (
          <ListGroup
            mt="1gap"
            data={[
              {
                label: 'Status',
                value: (
                  <Text color={question?.enabled ? 'success' : 'error'}>{question?.enabled ? 'Ativa' : 'Inativa'}</Text>
                ),
                xs: 12,
                md: 'flex',
              },
              {
                label: 'Tipo',
                value: QuestionTypeString[question.type],
                xs: 12,
                md: 'flex',
              },
              question.type === QuestionType.DISCURSIVE && {
                label: 'Limite de Caracteres',
                value: question.maxLength || 'Sem limite',
              },
              'break',
              { label: 'Enunciado', value: question.description, xs: 12 },
            ]}
          />
        )}

        {question?.type === QuestionType.OPTIONS && (
          <>
            <Text mt="2gap" variant="subtitle">
              Opções
            </Text>
            <State {...optionsState}>
              {options && (
                <ListGroup
                  mt="1gap"
                  data={options.map((option) => ({
                    value: <Html html={option.description} />,
                    label: (
                      <Text color={option.isCorrect ? 'success' : 'error'} w={60} weight="600">
                        {option.isCorrect ? 'Correta' : 'Incorreta'}
                      </Text>
                    ),
                    xs: 12,
                  }))}
                />
              )}
            </State>
          </>
        )}

        <Text mt="2gap" variant="subtitle">
          Categorias
        </Text>
        <State {...categoriesState}>
          <ListGroup
            mt="1gap"
            data={categories?.map((category) => ({
              label: category.parent?.name,
              value: category.name,
              xs: 12,
            }))}
          />
        </State>
      </State>
    </>
  );
}
