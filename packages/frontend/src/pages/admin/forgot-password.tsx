import React, { useState } from 'react';
import { useToggleState } from 'react-state-hooks';

import LinkChild from '@prova-livre/frontend/components/LinkChild';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import { Navigate } from '@prova-livre/frontend/router';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { AuthRequestPasswordRecoverySchema } from '@prova-livre/shared/dtos/admin/auth/auth.dto';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent } from '@react-bulk/core';
import { Box, Button, Card, Divider, Form, Grid, Input, Modal, Text } from '@react-bulk/web';
import { object } from 'dot-object';

export default function Page() {
  const { status } = useAdminAuth();
  const [modalVisible, toogleModalVisible] = useToggleState(false);
  const [loading, setLoading] = useState(false);

  const handleRecoveryPassword = async (e: RbkFormEvent, data: AnyObject) => {
    data = object(data);

    const errors = validate({
      formRef: e.form,
      data,
      schema: AuthRequestPasswordRecoverySchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    setLoading(true);
    try {
      await ApiAdmin.post('/auth/request-password-recovery', data);
      e.form.clear();

      setLoading(false);
      toogleModalVisible();
    } catch (err) {
      e.form.setErrors({ email: getError(err) });
    }
  };

  if (status === 'authenticated') {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Box flex bg="primary">
        <Grid flex>
          <Box bg="primary.dark" md="auto" xs={12}>
            <Box center flex p="3gap">
              <Card corners={4} maxw={480} p="3gap" w="100%">
                <Text center color="primary" variant="h2">
                  Prova Livre
                </Text>
                <Divider mx="-3gap" my={2} />
                <Text center color="warning.dark" variant="subtitle">
                  Área Administrativa
                </Text>
                <Text mt="2gap" variant="title">
                  Recuperação de senha
                </Text>

                <Text mt="2gap" variant="primary">
                  Informe o seu e-mail de acesso para que possamos enviar as instruções de recuperação de senha.
                </Text>

                <Form mt="1gap" onSubmit={handleRecoveryPassword}>
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
                      <Button loading={loading} type="submit">
                        Continuar
                      </Button>
                    </Box>
                    <Box xs={12}>
                      <LinkChild href="/admin/login">
                        <Button variant="text">Voltar para Login</Button>
                      </LinkChild>
                    </Box>
                  </Grid>
                </Form>
              </Card>
            </Box>
          </Box>
          <Box md xs={{ display: 'none' }} />
        </Grid>
      </Box>

      <Modal visible={modalVisible} w={480}>
        <Text variant="subtitle">Recuperação de Senha</Text>
        <Divider mx="-1gap" my="1gap" />
        <Text>As instruções para recuperação de senha foram enviadas para o e-mail informado.</Text>
        <Text mt="1gap">
          Caso não tenha recebido o e-mail dentro de alguns minutos, verifique a pasta de spam ou tente novamente.
        </Text>
        <Divider mx="-1gap" my="1gap" />
        <Box alignItems="flex-end">
          <LinkChild href="/admin/login">
            <Button onPress={toogleModalVisible}>Voltar para Login</Button>
          </LinkChild>
        </Box>
      </Modal>
    </>
  );
}
