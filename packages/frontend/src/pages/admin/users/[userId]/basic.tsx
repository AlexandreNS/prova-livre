import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import Icon from '@prova-livre/frontend/components/Icon';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { useNavigate } from '@prova-livre/frontend/router';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { UserRole, UserRoleString } from '@prova-livre/shared/constants/UserRole';
import { UserCreateSchema, type UserGetSchema } from '@prova-livre/shared/dtos/admin/user/user.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate, yup } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Form, Grid, Input, Select, Text } from '@react-bulk/web';
import { object } from 'dot-object';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const navigate = useNavigate();
  const userId = useIdParam('userId');

  const [hasWritePermission] = hasPermissionList(user?.role, 'User-Write');

  const {
    data: userData,
    state,
    revalidate: revalidateUser,
  } = useRequest<SchemaRoute<typeof UserGetSchema>>(hasWritePermission && userId && `/users/${userId}`, {
    noCache: true,
    autoRevalidate: false,
  });

  const handleSubmitUser = async (e: RbkFormEvent, data: AnyObject) => {
    data = object(data);

    const errors = validate({
      formRef: e.form,
      data,
      schema: UserCreateSchema.body,
      extra: user?.name
        ? {
            name: yup.string().required(),
          }
        : undefined,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      const response = await ApiAdmin.save('/users', userId, data);

      revalidateUser();
      navigate('/admin/users/:userId', {
        params: { userId: response.data.id },
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
      <State {...(userId ? state : {})}>
        <Form onSubmit={handleSubmitUser}>
          {!userId && (
            <Card center noWrap row mt="1gap">
              <Icon color="info" name="Info" size={20} weight="bold" />
              <Box flex ml="1gap">
                <Text color="info" weight="500">
                  Após a adição um email de confirmação será enviado para o Usuário
                </Text>
              </Box>
            </Card>
          )}

          <Card mt="1gap">
            <Grid gap>
              <Box xs={12}>
                <Input label="Nome Completo" name="name" required={!!userData?.name} value={userData?.name} />
              </Box>
              <Box xs={12}>
                <Input required label="E-mail" name="email" value={userData?.email} />
              </Box>
              <Box xs={12}>
                <Select
                  label="Perfil"
                  name="role"
                  value={userData?.role}
                  options={Object.entries(UserRoleString)
                    .filter(([role]) => ![UserRole.SUPER_USER].includes(role as any))
                    .map(([value, label]) => ({
                      value,
                      label,
                    }))}
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
