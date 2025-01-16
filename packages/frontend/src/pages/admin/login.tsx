import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import { Navigate, useNavigate } from '@prova-livre/frontend/router';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Form, Grid, Input, Text } from '@react-bulk/web';

export default function Page() {
  const { status, login } = useAdminAuth();
  const navigate = useNavigate();
  const toaster = useToaster();

  const handleLogin = async (e: RbkFormEvent, data: AnyObject) => {
    try {
      console.log(status, data);
      await login(data.email, data.password);
      navigate('/admin');
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (status === 'authenticated') {
    return <Navigate to="/admin" />;
  }

  return (
    <>
      <Box flex bg="primary">
        <Grid flex>
          <Box bg="primary.dark" md="auto" xs={12}>
            <Box center flex p="3gap">
              <Card corners={4} maxw={400} p="3gap" w="100%">
                <Text center color="primary" variant="h2">
                  Prova Livre
                </Text>
                <Text mt="2gap" variant="title">
                  Fazer Login
                </Text>

                <Form mt="1gap" onSubmit={handleLogin}>
                  <Grid gap>
                    <Box xs={12}>
                      <Input
                        label="E-mail"
                        name="email"
                        placeholder="Digite seu e-mail"
                        type="email"
                        value="admin@provalivre.xyz"
                      />
                    </Box>
                    <Box xs={12}>
                      <Input secure label="Senha" name="password" placeholder="Digite sua senha" value="123456" />
                    </Box>
                    <Box xs={12}>
                      <Button mt="1gap" size="large" type="submit">
                        Entrar
                      </Button>
                    </Box>
                  </Grid>
                </Form>
              </Card>
            </Box>
          </Box>
          <Box md xs={12} />
        </Grid>
      </Box>
    </>
  );
}
