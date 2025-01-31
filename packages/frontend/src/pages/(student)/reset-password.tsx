import type { SchemaBody, SchemaResponse, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import React, { useEffect, useRef, useState } from 'react';
import { useToggleState } from 'react-state-hooks';

import InputPassword from '@prova-livre/frontend/components/InputPassword';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useQueryParams from '@prova-livre/frontend/hooks/useQueryParams';
import useStudentAuth from '@prova-livre/frontend/hooks/useStudentAuth';
import { Navigate } from '@prova-livre/frontend/router';
import ApiStudent from '@prova-livre/frontend/services/ApiStudent';
import {
  AuthRequestPasswordRecoverySchema,
  AuthResetPasswordSchema,
  AuthVerifyTokenResetPasswordSchema,
} from '@prova-livre/shared/dtos/student/auth/auth.dto';
import { validate, yup } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent } from '@react-bulk/core';
import { Box, Button, Card, Divider, Form, Grid, Input, Modal, Text } from '@react-bulk/web';
import { object } from 'dot-object';

export default function Page() {
  const { status } = useStudentAuth();
  const [modalMessage, setModalMessage] = useState<string>();
  const [params] = useQueryParams<SchemaBody<typeof AuthVerifyTokenResetPasswordSchema>>();

  const [loadingStudent, setLoadingStudent] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [student, setStudent] = useState<SchemaResponse<typeof AuthVerifyTokenResetPasswordSchema> | null>(null);

  useEffect(() => {
    (async () => {
      if (!loadingStudent) return;

      try {
        const response = await ApiStudent.post<SchemaResponse<typeof AuthVerifyTokenResetPasswordSchema>>(
          '/auth/verify-token-reset-password',
          { securityCode: params.securityCode },
        );
        setStudent(response.data);
      } catch (err) {
        setModalMessage(getError(err));
      }

      setLoadingStudent(false);
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
      await ApiStudent.post('/auth/reset-password', data);
      e.form.clear();

      setLoadingSubmit(false);
      setModalMessage('A sua senha foi alterada com sucesso!');
    } catch (err) {
      setModalMessage(getError(err));
    }
  };

  return (
    <>
      <State loading={loadingStudent}>
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
                    Redefinição de senha
                  </Text>

                  <Text mt="2gap" variant="primary">
                    Digite a nova senha e confirme-a abaixo.
                  </Text>

                  <Form mt="1gap" onSubmit={handleResetPassword}>
                    <Grid gap>
                      <Box xs={12}>
                        <Input disabled label="E-mail" value={student?.email} />
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
                        <LinkChild href="/login">
                          <Button variant="text">Voltar para Login</Button>
                        </LinkChild>
                      </Box>
                    </Grid>
                  </Form>
                </Card>
              </Box>
            </Box>
          </Grid>
        </Box>

        <Modal visible={!!modalMessage} w={480}>
          <Text variant="subtitle">Redefinição de senha</Text>
          <Divider mx="-1gap" my="1gap" />
          <Text>{modalMessage}</Text>
          <Divider mx="-1gap" my="1gap" />
          <Box alignItems="flex-end">
            <LinkChild href="/login">
              <Button>Voltar para Login</Button>
            </LinkChild>
          </Box>
        </Modal>
      </State>
    </>
  );
}
