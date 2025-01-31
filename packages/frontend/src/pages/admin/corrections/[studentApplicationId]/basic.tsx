import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';
import type { AnyObject } from '@prova-livre/shared/types/util.type';

import React, { useState } from 'react';

import Html from '@prova-livre/frontend/components/Html';
import InputHtml from '@prova-livre/frontend/components/InputHtml';
import ListGroup from '@prova-livre/frontend/components/ListGroup';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { QuestionType } from '@prova-livre/shared/constants/QuestionType';
import { CorrectionGetSchema, CorrectionUpdateSchema } from '@prova-livre/shared/dtos/admin/correction/correction.dto';
import { array } from '@prova-livre/shared/helpers/array.helper';
import { distance, humanize } from '@prova-livre/shared/helpers/date.helper';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { clamp, number } from '@prova-livre/shared/helpers/number.helper';
import { string } from '@prova-livre/shared/helpers/string.helper';
import { type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Badge, Box, Button, Card, Checkbox, Divider, Form, Grid, Input, Modal, Text, Tooltip } from '@react-bulk/web';

const CORRECTION_STATUS_COLOR = {
  correct: 'success',
  partial: 'warning',
  incorrect: 'error',
} as const;

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const studentApplicationId = useIdParam('studentApplicationId');

  const [modalData, setModalData] = useState<AnyObject | null>(null);

  const [hasWritePermission] = hasPermissionList(user?.role, 'Correction-Write');

  const {
    data: { exam, studentApplication } = {},
    state,
    revalidate,
  } = useRequest<SchemaRoute<typeof CorrectionGetSchema>>(
    hasWritePermission && studentApplicationId && `/corrections/${studentApplicationId}`,
    {
      noCache: true,
      autoRevalidate: false,
    },
  );

  const hasMinScore = number(exam?.minScore) > 0;
  const isCorrected = studentApplication?.questions.every(({ studentScore }) => typeof studentScore === 'number');

  const handleSubmitCorrection = async (e: RbkFormEvent, data: AnyObject) => {
    const errors = validate({
      formRef: e.form,
      data,
      schema: CorrectionUpdateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      await ApiAdmin.put(`/corrections/${studentApplicationId}`, data);
      toaster.success('Os dados foram salvos.');

      await revalidate();
    } catch (err) {
      toaster.error(getError(err));
    }

    setModalData(null);
  };

  if (!hasWritePermission) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader title="Correção de Avaliação" />

      <State {...(studentApplicationId ? state : {})}>
        <ListGroup
          mt="1gap"
          data={[
            {
              xs: 12,
              md: 'flex',
              label: 'Avaliado',
              value: (
                <Box row alignItems="flex-end">
                  <Text mr={2} variant="secondary">
                    #{studentApplication?.student.id}
                  </Text>
                  <Text mr={2}>{studentApplication?.student.name || '[sem nome]'}</Text>
                  <Text mr={2} variant="secondary">{`<${studentApplication?.student.email}>`}</Text>
                </Box>
              ),
            },
            {
              value: isCorrected ? (
                <Badge color="success">Corrigido</Badge>
              ) : (
                <Badge color="error">Não Corrigido</Badge>
              ),
            },
            'break',
            {
              minw: 100,
              label: 'ID',
              value: studentApplication?.id,
            },
            {
              xs: 12,
              md: 'flex',
              label: 'Iniciado em',
              value: humanize(studentApplication?.startedAt),
            },
            {
              xs: 12,
              md: 'flex',
              label: 'Enviado em',
              value: humanize(studentApplication?.submittedAt),
            },
            {
              xs: 12,
              md: 'auto',
              label: 'Tempo de Prova',
              value: distance(studentApplication?.startedAt, studentApplication?.submittedAt),
            },
            'break',

            {
              xs: 12,
              md: 'flex',
              label: 'Prova',
              value: exam?.name,
            },
            {
              xs: 12,
              md: 'flex',
              label: 'Pontuação obtida',
              value: studentApplication?.studentScore,
            },
            hasMinScore && {
              xs: 12,
              md: 'flex',
              label: 'Pontuação para aprovação',
              value: exam?.minScore,
            },
            {
              xs: 12,
              md: 'flex',
              label: 'Pontuação total da avaliação',
              value: exam?.maxScore,
            },
          ]}
        />

        {studentApplication?.questions.map((question, index) => {
          const correctOptions = question.questionOptions.filter(({ isCorrect }) => isCorrect).map(({ id }) => id);
          const selected = array(string(question.answer).split(',').map(number));

          return (
            <Box key={question.id}>
              <Input name={`answers.${index}.questionId`} type="hidden" value={question.id} />

              <Divider mx="-2gap" my="2gap" />

              <Card
                row
                alignItems="center"
                borderBottom={0}
                borderBottomLeftRadius={0}
                borderBottomRightRadius={0}
                shadow={0}
                border={
                  question.correctionStatus ? `${CORRECTION_STATUS_COLOR[question.correctionStatus]}` : 'gray.lighter'
                }
              >
                <Box row alignItems="center" g={0.5}>
                  <Text mr="0.5gap" variant="secondary" weight="600">
                    Questão {index + 1}.
                  </Text>

                  {question.correctionStatus === 'correct' && (
                    <Badge color="success" size={3}>
                      Correto
                    </Badge>
                  )}
                  {question.correctionStatus === 'partial' && (
                    <Badge color="warning" size={3}>
                      Parcial
                    </Badge>
                  )}
                  {question.correctionStatus === 'incorrect' && (
                    <Badge color="error" size={3}>
                      Incorreto
                    </Badge>
                  )}

                  <Badge color="info" size={3}>
                    Nota {number(question.studentScore)}
                    {question.studentScore !== question.questionScore && ` de ${question.questionScore}`}
                  </Badge>

                  {!question.correctionStatus && (
                    <Badge color="error" size={3}>
                      Questão pendente de correção
                    </Badge>
                  )}
                </Box>

                <Box flex alignItems="end">
                  {hasWritePermission && (
                    <Button
                      size="small"
                      onPress={() =>
                        setModalData({
                          question,
                          title: `Questão ${index + 1}`,
                        })
                      }
                    >
                      Editar correção
                    </Button>
                  )}
                </Box>
              </Card>

              <Card
                borderTop={0}
                borderTopLeftRadius={0}
                borderTopRightRadius={0}
                shadow={0}
                bg={
                  question.correctionStatus
                    ? `${CORRECTION_STATUS_COLOR[question.correctionStatus]}.main.5`
                    : 'background'
                }
                border={
                  question.correctionStatus ? `${CORRECTION_STATUS_COLOR[question.correctionStatus]}` : 'gray.lighter'
                }
              >
                <Html html={question.description} mb="1gap" />

                {question.feedback ? (
                  <Box bg="gray.main.15" corners={4} mb="1gap" p="1gap" pb={0}>
                    <Text color="info.dark" mb="0.5gap" variant="secondary" weight="600">
                      Feedback da correção:
                    </Text>
                    <Html html={question.feedback} mb="1gap" />
                  </Box>
                ) : null}

                {question.type === QuestionType.DISCURSIVE && (
                  <>
                    <Text color="info.darker" mb="0.5gap" variant="secondary" weight="600">
                      Resposta:
                    </Text>

                    <Input multiline disabled={true} name={`answers.${index}.answer`} value={question.answer} />
                  </>
                )}

                {question.type === QuestionType.OPTIONS && (
                  <>
                    {number(question.correctOptionsCount) > 1 && (
                      <Text color="warning" variant="secondary" weight="600">
                        Acertou {question.correctSelectedOptionsCount} de {question.correctOptionsCount} opções
                        corretas.
                      </Text>
                    )}

                    {question.questionOptions.map((option, optionIndex) => {
                      const isOptionSelected = selected.includes(option.id);
                      const isOptionCorrect = correctOptions.includes(option.id);

                      return (
                        <Card
                          key={option.id}
                          bg={optionIndex % 2 ? 'gray.main.10' : 'gray.main.15'}
                          mt="0.5gap"
                          shadow={0}
                        >
                          <Grid gap noWrap row>
                            <Box w={90}>
                              {isOptionSelected && (
                                <Tooltip
                                  color={isOptionCorrect ? 'success' : 'error'}
                                  title={isOptionCorrect ? 'Correta' : 'Incorreta'}
                                >
                                  <Box noWrap row>
                                    <Box mr={-4} zIndex={2}>
                                      {isOptionCorrect ? <Badge color="success" /> : <Badge color="error" />}
                                    </Box>

                                    <Badge color="gray.light" labelStyle={{ ml: '1gap' }} w="100%">
                                      Escolhida
                                    </Badge>
                                  </Box>
                                </Tooltip>
                              )}

                              {isOptionCorrect && !isOptionSelected && (
                                <Badge color="gray" w="100%">
                                  Correta
                                </Badge>
                              )}
                            </Box>

                            <Box w={32}>
                              <Text center variant="secondary" weight="600">
                                {String.fromCharCode((optionIndex % 26) + 65)}
                              </Text>
                            </Box>
                            <Box align="stretch">
                              <Divider vertical h="100%" />
                            </Box>
                            <Box>
                              <Checkbox
                                controlled
                                checked={isOptionSelected}
                                disabled={true}
                                my="-0.6gap"
                                unique={number(question.correctOptionsCount) === 1}
                              />
                            </Box>
                            <Box xs>
                              <Html html={option.description} />
                            </Box>
                          </Grid>
                        </Card>
                      );
                    })}
                  </>
                )}
              </Card>
            </Box>
          );
        })}

        <Modal visible={!!modalData} onClose={() => setModalData(null)}>
          <Form onSubmit={handleSubmitCorrection}>
            <Text variant="subtitle">Editar Correção da {modalData?.title}</Text>

            <Divider mx="-1gap" my="1gap" />

            <Input
              name="studentApplicationQuestionId"
              type="hidden"
              value={modalData?.question.studentApplicationQuestionId}
            />

            <Grid gap>
              <Box lg={3} md={4} xs={12}>
                <Input
                  required
                  label={`Nota (máx. ${modalData?.question.questionScore})`}
                  mask={(value) => clamp(value, 0, modalData?.question.questionScore)}
                  name="studentScore"
                  type="number"
                  unmask={(value) => clamp(value, 0, modalData?.question.questionScore)}
                  value={modalData?.question.studentScore}
                />
              </Box>
              <Box xs={12}>
                <InputHtml label="Feedback (opcional)" name="feedback" value={modalData?.question.feedback} />
              </Box>
            </Grid>

            <Divider mx="-1gap" my="1gap" />

            <Grid gap row align="end">
              <Box xs>
                <Button variant="outline" onPress={() => setModalData(null)}>
                  Cancelar
                </Button>
              </Box>
              <Box xs>
                <Button type="submit">Salvar Correção</Button>
              </Box>
            </Grid>
          </Form>
        </Modal>
      </State>
    </>
  );
}
