import InputPassword from '@prova-livre/frontend/components/InputPassword';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import ApiStudent from '@prova-livre/frontend/services/ApiStudent';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Form, Grid } from '@react-bulk/web';

export default function Page() {
  const toaster = useToaster();

  const handleSubmit = async (e: RbkFormEvent, data: AnyObject) => {
    try {
      await ApiStudent.put('/me/password', data);

      toaster.success('Os dados foram salvos.');
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Card mt="1gap">
        <Grid gap>
          <Box xs={12}>
            <InputPassword required autoComplete="current-password" label="Senha Atual" name="currentPassword" />
          </Box>
          <Box xs={12}>
            <InputPassword required autoComplete="new-password" label="Nova Senha" name="password" />
          </Box>
          <Box xs={12}>
            <InputPassword required autoComplete="new-password" label="Confirme a Nova Senha" name="passwordConfirm" />
          </Box>
        </Grid>
      </Card>

      <Button align="end" mt="1gap" type="submit">
        Salvar
      </Button>
    </Form>
  );
}
