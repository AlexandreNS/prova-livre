import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import InputHtml from '@prova-livre/frontend/components/InputHtml';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { useNavigate } from '@prova-livre/frontend/router';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { ExamCreateSchema, ExamGetSchema } from '@prova-livre/shared/dtos/admin/exam/exam.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Divider, Form, Grid, Input, Text } from '@react-bulk/web';
import { object } from 'dot-object';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const navigate = useNavigate();
  const examId = useIdParam('examId');

  const [hasWritePermission] = hasPermissionList(user?.role, 'Exam-Write');

  const { data: exam, state } = useRequest<SchemaRoute<typeof ExamGetSchema>>(
    hasWritePermission && examId && `/exams/${examId}`,
    {
      noCache: true,
      autoRevalidate: false,
    },
  );

  const handleSubmitExam = async (e: RbkFormEvent, data: AnyObject) => {
    data = object(data);

    const errors = validate({
      formRef: e.form,
      data,
      schema: ExamCreateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      const response = await ApiAdmin.save('/exams', examId, data);

      navigate('/admin/exams/:examId', {
        params: { examId: response.data.id },
      });

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
      <State {...(examId ? state : {})}>
        <Form onSubmit={handleSubmitExam}>
          <Card mt="1gap">
            <Grid gap>
              <Box xs={12}>
                <Input required label="Nome" name="name" value={exam?.name} />
              </Box>
              <Box xs={12}>
                <Input label="Título Público" name="title" value={exam?.title} />
              </Box>
              <Box xs={12}>
                <InputHtml label="Descrição" name="description" value={exam?.description} />
              </Box>
              <Box xs={12}>
                <Divider mx="-1gap" />
              </Box>
              <Box xs={12}>
                <Text variant="subtitle">Pontuação</Text>
              </Box>
              <Box lg={3} md={6} xs={12}>
                <Input label="Mínimo para Aprovação" name="minScore" type="number" value={exam?.minScore} />
              </Box>
              <Box lg={3} md={6} xs={12}>
                <Input label="Nota Total da Prova" name="maxScore" type="number" value={exam?.maxScore} />
              </Box>
            </Grid>
          </Card>

          <Box mt="1gap">
            <Button align="end" type="submit">
              Salvar
            </Button>
          </Box>
        </Form>
      </State>
    </>
  );
}
