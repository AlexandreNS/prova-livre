import type { MeGetSchema } from '@prova-livre/shared/dtos/admin/me/me.dto';
import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Form, Grid, Input } from '@react-bulk/web';

export default function Page() {
  const toaster = useToaster();

  const { data: user, ...state } = useRequest<SchemaRoute<typeof MeGetSchema>>('/me', {
    autoRevalidate: false,
    noCache: true,
  });

  const handleSubmit = async (e: RbkFormEvent, data: AnyObject) => {
    try {
      await ApiAdmin.put('/me', data);

      toaster.success('Os dados foram salvos.');
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  return (
    <>
      <State {...state}>
        <Form onSubmit={handleSubmit}>
          <Card mt="1gap">
            <Grid gap>
              <Box xs={12}>
                <Input required label="Nome Completo" name="name" value={user?.name} />
              </Box>
              <Box xs={12}>
                <Input disabled required label="E-mail" value={user?.email} />
              </Box>
            </Grid>
          </Card>

          <Button align="end" mt="1gap" type="submit">
            Salvar
          </Button>
        </Form>
      </State>
    </>
  );
}
