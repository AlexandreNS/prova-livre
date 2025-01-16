import { useState } from 'react';

import Icon from '@prova-livre/frontend/components/Icon';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Form, Grid, Input, Tooltip } from '@react-bulk/web';

export default function Page() {
  const toaster = useToaster();

  const [isSecure, setIsSecure] = useState(true);

  const handleSubmit = async (e: RbkFormEvent, data: AnyObject) => {
    try {
      await ApiAdmin.put('/me/password', data);

      toaster.success('Os dados foram salvos.');
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  return (
    <>
      <Box alignItems="end" mt="1gap">
        <Tooltip position="left" title={isSecure ? 'Mostrar senhas' : 'Ocultar senhas'}>
          <Button
            circular
            bg="background"
            startAddon={({ color }) => <Icon color={color} name={isSecure ? 'EyeSlash' : 'Eye'} />}
            variant="outline"
            onPress={() => setIsSecure((current) => !current)}
          />
        </Tooltip>
      </Box>

      <Form onSubmit={handleSubmit}>
        <Card mt="1gap">
          <Grid gap>
            <Box xs={12}>
              <Input
                required
                autoComplete="current-password"
                label="Senha Atual"
                name="currentPassword"
                secure={isSecure}
              />
            </Box>
            <Box xs={12}>
              <Input required autoComplete="new-password" label="Nova Senha" name="password" secure={isSecure} />
            </Box>
            <Box xs={12}>
              <Input
                required
                autoComplete="new-password"
                label="Confirme a Nova Senha"
                name="passwordConfirm"
                secure={isSecure}
              />
            </Box>
          </Grid>
        </Card>

        <Button align="end" mt="1gap" type="submit">
          Salvar
        </Button>
      </Form>
    </>
  );
}
