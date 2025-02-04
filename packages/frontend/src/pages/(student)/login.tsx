import InputPassword from '@prova-livre/frontend/components/InputPassword';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useStudentAuth from '@prova-livre/frontend/hooks/useStudentAuth';
import { Navigate, useNavigate } from '@prova-livre/frontend/router';
import LocalStorage from '@prova-livre/frontend/services/LocalStorage';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Divider, Form, Grid, Input, Text } from '@react-bulk/web';

export default function Page() {
  const { status, login } = useStudentAuth();
  const navigate = useNavigate();
  const toaster = useToaster();
  const lastLogin = LocalStorage.get('lastLogin');

  const handleLogin = async (e: RbkFormEvent, data: AnyObject) => {
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (status === 'authenticated') {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Box flex bg="primary">
        <Grid flex>
          <Box md xs={{ display: 'none' }} />
          <Box bg="primary.dark" md="auto" xs={12}>
            <Box center flex p="3gap">
              <Card corners={4} maxw={480} p="3gap" w="100%">
                <Text center color="primary" variant="h2">
                  Prova Livre
                </Text>
                <Divider mx="-3gap" my={2} />
                <Text center color="primary.light" variant="subtitle">
                  Área do Estudante
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
                        value={lastLogin}
                      />
                    </Box>
                    <Box xs={12}>
                      <InputPassword label="Senha" name="password" placeholder="Digite sua senha" />
                    </Box>
                    <Box flex alignItems="flex-start" xs={12}>
                      <Box>
                        <LinkChild href="/forgot-password">
                          <Button variant="text">Esqueceu sua senha?</Button>
                        </LinkChild>
                      </Box>
                    </Box>
                    <Box xs={12}>
                      <Button size="large" type="submit">
                        Entrar
                      </Button>
                    </Box>
                  </Grid>
                </Form>
              </Card>
            </Box>
          </Box>
        </Grid>
      </Box>
    </>
  );
}
