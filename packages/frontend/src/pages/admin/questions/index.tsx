import type { SchemaQueryParams, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import Html from '@prova-livre/frontend/components/Html';
import Icon from '@prova-livre/frontend/components/Icon';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import Pagination from '@prova-livre/frontend/components/Pagination';
import State from '@prova-livre/frontend/components/State';
import { confirm } from '@prova-livre/frontend/helpers/alert.helper';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useQueryParams from '@prova-livre/frontend/hooks/useQueryParams';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { QuestionTypeString } from '@prova-livre/shared/constants/QuestionType';
import { QuestionListSchema } from '@prova-livre/shared/dtos/admin/question/question.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { type RbkPointerEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Scrollable, Text, Tooltip } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();

  const [hasReadPermission, hasWritePermission, hasDeletePermission] = hasPermissionList(
    user?.role,
    'Question-Read',
    'Question-Write',
    'Question-Delete',
  );

  const [params, updateParams] = useQueryParams<SchemaQueryParams<typeof QuestionListSchema>>({
    page: 1,
  });

  const {
    data: questions,
    state,
    revalidate: revalidateQuestions,
  } = useRequest<SchemaRoute<typeof QuestionListSchema>>(hasReadPermission && '/questions', { params });

  const handleDeleteQuestion = async (_: RbkPointerEvent, questionId: number) => {
    if (!confirm('Deseja remover permanentemente a questão?')) {
      return;
    }

    try {
      await ApiAdmin.delete(`/questions/${questionId}`);
      await revalidateQuestions();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasReadPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader title="Banco de Questões" onSearch={(search) => updateParams({ search })}>
        {hasWritePermission && (
          <LinkChild href="/admin/questions/add/basic">
            <Button>Adicionar</Button>
          </LinkChild>
        )}
      </PageHeader>

      <State {...state}>
        {questions?.rows?.map((question) => (
          <ListGroup
            key={question.id}
            mt="1gap"
            data={[
              {
                minw: 100,
                label: 'ID',
                value: question.id,
              },
              {
                xs: 12,
                md: 'flex',
                label: 'Tipo',
                value: QuestionTypeString[question.type],
              },
              {
                xs: 12,
                md: 'flex',
                label: 'Status',
                value: (
                  <Text color={question?.enabled ? 'success' : 'error'} weight="600">
                    {question?.enabled ? 'Ativa' : 'Inativa'}
                  </Text>
                ),
              },
              'break',
              {
                label: 'Enunciado',
                value: (
                  <Scrollable contentInset={1} maxh={120} ml={-1} mr="-0.5gap">
                    <Html html={question.description} />
                  </Scrollable>
                ),
              },
            ]}
            right={
              <Box m="-0.5gap">
                <Tooltip title="Ver">
                  <LinkChild href={`/admin/questions/${question.id}`}>
                    <Button
                      circular
                      startAddon={({ color }) => <Icon color={color} name="CaretRight" />}
                      variant="text"
                    />
                  </LinkChild>
                </Tooltip>
                {hasWritePermission && (
                  <Tooltip title="Editar">
                    <LinkChild href={`/admin/questions/${question.id}/basic`}>
                      <Button
                        circular
                        startAddon={({ color }) => <Icon color={color} name="Pencil" />}
                        variant="text"
                      />
                    </LinkChild>
                  </Tooltip>
                )}
                {hasDeletePermission && (
                  <Tooltip title="Remover">
                    <Button
                      circular
                      color="error"
                      startAddon={({ color }) => <Icon color={color} name="Trash" />}
                      variant="text"
                      onPress={(e) => handleDeleteQuestion(e, question.id)}
                    />
                  </Tooltip>
                )}
              </Box>
            }
          />
        ))}

        <Pagination {...questions} onChange={updateParams} />
      </State>
    </>
  );
}
