import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { useNavigate } from '@prova-livre/frontend/router';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { StudentCreateSchema, type StudentGetSchema } from '@prova-livre/shared/dtos/admin/student/student.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate, yup } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Form, Grid, Input } from '@react-bulk/web';
import { object } from 'dot-object';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const navigate = useNavigate();
  const studentId = useIdParam('studentId');

  const [hasWritePermission] = hasPermissionList(user?.role, 'Student-Write');

  const { data: student, state } = useRequest<SchemaRoute<typeof StudentGetSchema>>(
    hasWritePermission && studentId && `/students/${studentId}`,
    {
      noCache: true,
      autoRevalidate: false,
    },
  );

  const handleSubmitStudent = async (e: RbkFormEvent, data: AnyObject) => {
    data = object(data);

    const errors = validate({
      formRef: e.form,
      data,
      schema: StudentCreateSchema.body,
      extra: student?.name
        ? {
            name: yup.string().required(),
          }
        : undefined,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      const response = await ApiAdmin.save('/students', studentId, data);

      navigate('/admin/students/:studentId', {
        params: { studentId: response.data.id },
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
      <State {...(studentId ? state : {})}>
        <Form onSubmit={handleSubmitStudent}>
          <Card mt="1gap">
            <Grid gap>
              <Box xs={12}>
                <Input label="Nome Completo" name="name" required={!!student?.name} value={student?.name} />
              </Box>
              <Box xs={12}>
                <Input required label="E-mail" name="email" value={student?.email} />
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
