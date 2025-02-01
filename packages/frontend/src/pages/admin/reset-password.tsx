import type { SchemaBody, SchemaResponse } from '@prova-livre/shared/types/schema.type';

import React, { useEffect, useState } from 'react';

import InputPassword from '@prova-livre/frontend/components/InputPassword';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useQueryParams from '@prova-livre/frontend/hooks/useQueryParams';
import { Navigate } from '@prova-livre/frontend/router';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import {
  AuthResetPasswordSchema,
  AuthVerifyTokenResetPasswordSchema,
} from '@prova-livre/shared/dtos/admin/auth/auth.dto';
import { validate, yup } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent } from '@react-bulk/core';
import { Box, Button, Card, Divider, Form, Grid, Input, Modal, Text } from '@react-bulk/web';
import { object } from 'dot-object';

export default function Page() {
  const { status } = useAdminAuth();
  const [modalMessage, setModalMessage] = useState<string>();
  const [params] = useQueryParams<SchemaBody<typeof AuthVerifyTokenResetPasswordSchema>>();

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [user, setUser] = useState<SchemaResponse<typeof AuthVerifyTokenResetPasswordSchema> | null>(null);

  useEffect(() => {
    (async () => {
      if (!loadingUser) return;

      try {
        const response = await ApiAdmin.post<SchemaResponse<typeof AuthVerifyTokenResetPasswordSchema>>(
          '/auth/verify-token-reset-password',
          { securityCode: params.securityCode },
        );
        setUser(response.data);
      } catch (err) {
        setModalMessage(getError(err));
      }

      setLoadingUser(false);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.securityCode]);

  if (status === 'authenticated') {
    return <Navigate to="/" />;
  }

  const handleResetPassword = async (e: RbkFormEvent, data: AnyObject) => {
    data = object(data);
    data.securityCode = params.securityCode;

    const errors = validate({
      formRef: e.form,
      data,
      schema: AuthResetPasswordSchema.body,
      extra: {
        passwordConfirm: yup.string().equals([yup.ref('password')], 'As senhas não conferem!'),
      },
    });

    e.form.setErrors(errors);
    if (errors) return;

    setLoadingSubmit(true);
    try {
      await ApiAdmin.post('/auth/reset-password', data);
      e.form.clear();

      setLoadingSubmit(false);
      setModalMessage('A sua senha foi alterada com sucesso!');
    } catch (err) {
      setModalMessage(getError(err));
    }
  };

  return (
    <>
      <State loading={loadingUser}>
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
                    Redefinição de senha
                  </Text>

                  <Text mt="2gap" variant="primary">
                    Digite a nova senha e confirme-a abaixo.
                  </Text>

                  <Form mt="1gap" onSubmit={handleResetPassword}>
                    <Grid gap>
                      <Box xs={12}>
                        <Input disabled label="E-mail" value={user?.email} />
                      </Box>
                      <Box xs={12}>
                        <InputPassword required autoComplete="new-password" label="Nova Senha" name="password" />
                      </Box>
                      <Box xs={12}>
                        <InputPassword
                          required
                          autoComplete="new-password"
                          label="Confirme a Nova Senha"
                          name="passwordConfirm"
                        />
                      </Box>
                      <Box xs={12}>
                        <Button loading={loadingSubmit} type="submit">
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

        <Modal visible={!!modalMessage} w={480}>
          <Text variant="subtitle">Redefinição de senha</Text>
          <Divider mx="-1gap" my="1gap" />
          <Text>{modalMessage}</Text>
          <Divider mx="-1gap" my="1gap" />
          <Box alignItems="flex-end">
            <LinkChild href="/admin/login">
              <Button>Voltar para Login</Button>
            </LinkChild>
          </Box>
        </Modal>
      </State>
    </>
  );
}
