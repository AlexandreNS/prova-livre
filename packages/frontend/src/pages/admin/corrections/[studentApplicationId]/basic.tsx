import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { AnyObject } from '@prova-livre/shared/types/util.type';

import InputHtml from '@prova-livre/frontend/components/InputHtml';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { QuestionType, QuestionTypeString } from '@prova-livre/shared/constants/QuestionType';
import { CorrectionGetSchema, CorrectionUpdateSchema } from '@prova-livre/shared/dtos/admin/correction/correction.dto';
import { distance, humanize } from '@prova-livre/shared/helpers/date.helper';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { clamp } from '@prova-livre/shared/helpers/number.helper';
import { string } from '@prova-livre/shared/helpers/string.helper';
import { type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Form, Grid, Input } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const studentApplicationId = useIdParam('studentApplicationId');

  const [hasWritePermission] = hasPermissionList(user?.role, 'Correction-Write');

  const { data: studentApplication, state } = useRequest<SchemaRoute<typeof CorrectionGetSchema>>(
    hasWritePermission && studentApplicationId && `/corrections/${studentApplicationId}`,
    {
      noCache: true,
      autoRevalidate: false,
    },
  );

  const handleSubmitCorrection = async (e: RbkFormEvent, data: AnyObject) => {
    const errors = validate({
      formRef: e.form,
      data,
      schema: CorrectionUpdateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      await ApiAdmin.put(`/corrections/${studentApplicationId}`, data);
      toaster.success('Os dados foram salvos.');
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasWritePermission) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader title="Correção de Avaliação" />

      <State {...(studentApplicationId ? state : {})}>
        <ListGroup
          mt="1gap"
          data={[
            {
              xs: 12,
              label: 'Avaliado',
              value: studentApplication?.student.name || '[sem nome]',
            },
            {
              xs: 12,
              md: 'flex',
              label: 'Iniciado em',
              value: humanize(studentApplication?.startedAt),
            },
            {
              xs: 12,
              md: 'flex',
              label: 'Enviado em',
              value: humanize(studentApplication?.submittedAt),
            },
            {
              xs: 12,
              md: 'flex',
              label: 'Tempo de Prova',
              value: distance(studentApplication?.startedAt, studentApplication?.submittedAt),
            },
          ]}
        />

        {studentApplication?.studentApplicationQuestions
          ?.filter(({ question }) => question.type === QuestionType.DISCURSIVE)
          ?.map(({ question, ...studentApplicationQuestion }, index) => (
            <ListGroup
              key={index}
              mt="1gap"
              data={[
                {
                  label: 'Tipo',
                  value: QuestionTypeString[question.type],
                  xs: 12,
                  md: 'flex',
                },
                'break',
                {
                  label: 'Enunciado',
                  value: question.description,
                  xs: 12,
                },
                'break',
                {
                  xs: 12,
                  label: 'Resposta',
                  value: string(studentApplicationQuestion.answer).replace(/\n/g, '<br/>'),
                },
                'break',
                {
                  xs: 12,
                  value: (
                    <Form onSubmit={handleSubmitCorrection}>
                      <Input name="studentApplicationQuestionId" type="hidden" value={studentApplicationQuestion.id} />

                      <Grid gap>
                        <Box lg={3} md={4} xs={12}>
                          <Input
                            required
                            label={`Nota (máx. ${studentApplicationQuestion.questionScore})`}
                            mask={(value) => clamp(value, 0, studentApplicationQuestion.questionScore)}
                            name="studentScore"
                            type="number"
                            unmask={(value) => clamp(value, 0, studentApplicationQuestion.questionScore)}
                            value={studentApplicationQuestion.studentScore}
                          />
                        </Box>
                        <Box xs={12}>
                          <InputHtml
                            label="Feedback (opcional)"
                            name="feedback"
                            value={studentApplicationQuestion.feedback}
                          />
                        </Box>
                        <Box xs={12}>
                          <Button align="end" type="submit">
                            Salvar Correção
                          </Button>
                        </Box>
                      </Grid>
                    </Form>
                  ),
                },
              ]}
            />
          ))}
      </State>
    </>
  );
}
