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
import { ClassCreateSchema, type ClassGetSchema } from '@prova-livre/shared/dtos/admin/class/class.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Form, Grid, Input } from '@react-bulk/web';
import { object } from 'dot-object';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const navigate = useNavigate();
  const classId = useIdParam('classId');

  const [hasWritePermission] = hasPermissionList(user?.role, 'Class-Write');

  const { data: classData, state } = useRequest<SchemaRoute<typeof ClassGetSchema>>(
    hasWritePermission && classId && `/classes/${classId}`,
    {
      noCache: true,
      autoRevalidate: false,
    },
  );

  const handleSubmitClass = async (e: RbkFormEvent, data: AnyObject) => {
    data = object(data);

    const errors = validate({
      formRef: e.form,
      data,
      schema: ClassCreateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      const response = await ApiAdmin.save('/classes', classId, data);

      navigate('/admin/classes/:classId', {
        params: { classId: response.data.id },
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
      <State {...(classId ? state : {})}>
        <Form onSubmit={handleSubmitClass}>
          <Card mt="1gap">
            <Grid gap>
              <Box xs={12}>
                <Input required label="Nome" name="name" value={classData?.name} />
              </Box>
              <Box xs={12}>
                <InputHtml label="Descrição" minHeight={250} name="description" value={classData?.description} />
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
