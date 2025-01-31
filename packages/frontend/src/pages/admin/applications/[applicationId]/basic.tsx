import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import InputFetch from '@prova-livre/frontend/components/InputFetch';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { useNavigate } from '@prova-livre/frontend/router';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import {
  ApplicationCreateSchema,
  ApplicationGetSchema,
  ApplicationUpdateSchema,
} from '@prova-livre/shared/dtos/admin/application/application.dto';
import { isoLocalToUtc, isoUtcToLocal } from '@prova-livre/shared/helpers/date.helper';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate, yup } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Divider, Form, Grid, Input, Switch } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const navigate = useNavigate();
  const applicationId = useIdParam('applicationId');

  const [hasWritePermission] = hasPermissionList(user?.role, 'Application-Write');

  const {
    data: application,
    state,
    revalidate,
  } = useRequest<SchemaRoute<typeof ApplicationGetSchema>>(
    hasWritePermission && applicationId && `/applications/${applicationId}`,
    {
      noCache: true,
      autoRevalidate: false,
    },
  );

  const handleSubmitApplication = async (e: RbkFormEvent, data: AnyObject) => {
    const errors = validate({
      formRef: e.form,
      data,
      schema: applicationId ? ApplicationUpdateSchema.body : ApplicationCreateSchema.body,
      extra: {
        startedAt: yup.date(),
        endedAt: yup.date().min(yup.ref('startedAt'), 'A data de término deve ser posterior à data de início'),
      },
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      const response = await ApiAdmin.save('/applications', applicationId, data);
      await revalidate();

      navigate('/admin/applications/:applicationId', {
        params: { applicationId: response.data.id },
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
      <State {...(applicationId ? state : {})}>
        <Form onSubmit={handleSubmitApplication}>
          <Card mt="1gap">
            <Grid gap>
              <Box xs={12}>
                <InputFetch required label="Prova" name="examId" url="/exams" value={application?.examId} />
              </Box>
            </Grid>

            <Divider mx="-1gap" my="1gap" />

            <Grid gap>
              <Box lg={4} md={6} xs={12}>
                <Input
                  required
                  label="Início"
                  name="startedAt"
                  type="datetime-local"
                  unmask={isoLocalToUtc}
                  value={isoUtcToLocal(application?.startedAt)}
                />
              </Box>
              <Box p={0} xs={12} />
              <Box lg={4} md={6} xs={12}>
                <Input
                  required
                  label=" Término"
                  name="endedAt"
                  type="datetime-local"
                  unmask={isoLocalToUtc}
                  value={isoUtcToLocal(application?.endedAt)}
                />
              </Box>
            </Grid>

            <Divider mx="-1gap" my="1gap" />

            <Grid gap>
              <Box lg={4} md={6} xs={12}>
                <Input
                  required
                  label="Número de Tentativas"
                  min={1}
                  name="attempts"
                  type="number"
                  value={application?.attempts}
                />
              </Box>
              <Box p={0} xs={12} />
              <Box lg={4} md={6} xs={12}>
                <Input
                  label="Temporizador (em minutos)"
                  name="limitTime"
                  type="number"
                  value={application?.limitTime}
                />
              </Box>
            </Grid>

            <Divider mx="-1gap" my="1gap" />

            <Grid gap>
              <Box xs={12}>
                <Switch
                  checked={application?.showAnswers}
                  label="Avaliados podem visualizar o gabarito após a correção"
                  mr="0.5gap"
                  name="showAnswers"
                  size="small"
                />
              </Box>
              <Box xs={12}>
                <Switch
                  checked={application?.showScores}
                  label="Avaliados podem visualizar a nota de cada questão após a correção"
                  mr="0.5gap"
                  name="showScores"
                  size="small"
                />
              </Box>
              <Box xs={12}>
                <Switch
                  checked={application?.allowFeedback}
                  label="Avaliados podem enviar o feedback de prova"
                  mr="0.5gap"
                  name="allowFeedback"
                  size="small"
                />
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
