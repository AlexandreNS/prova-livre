import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import { useEffect, useRef, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { useListState, useObjectState } from 'react-state-hooks';

import ApplicationActions from '@prova-livre/frontend/components/ApplicationActions';
import ApplicationStatus from '@prova-livre/frontend/components/ApplicationStatus';
import Html from '@prova-livre/frontend/components/Html';
import Icon from '@prova-livre/frontend/components/Icon';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useParams from '@prova-livre/frontend/hooks/useParams';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiStudent from '@prova-livre/frontend/services/ApiStudent';
import { QuestionType } from '@prova-livre/shared/constants/QuestionType';
import { StudentApplicationStatus } from '@prova-livre/shared/constants/StudentApplicationStatus';
import {
  ApplicationFeedbackGetSchema,
  ApplicationGetSchema,
} from '@prova-livre/shared/dtos/student/application/application.dto';
import { array } from '@prova-livre/shared/helpers/array.helper';
import { add, distance, format, isoUtcToLocal } from '@prova-livre/shared/helpers/date.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { pluralize, string } from '@prova-livre/shared/helpers/string.helper';
import { type AnyObject, type RbkFormEvent, type TimeoutType, useTheme, useToaster } from '@react-bulk/core';
import { Badge, Box, Button, Card, Checkbox, Divider, Form, Grid, Input, Modal, Text, Tooltip } from '@react-bulk/web';
import { differenceInHours, formatDuration, intervalToDuration } from 'date-fns';

const CORRECTION_STATUS_COLOR = {
  correct: 'success',
  partial: 'warning',
  incorrect: 'error',
} as const;

export default function Page() {
  const theme = useTheme();
  const toaster = useToaster();

  const { applicationId = null } = useParams();

  const backupTimeoutRef = useRef<TimeoutType>();

  const [timer, setTimer] = useState<string>();
  const [questionCountChars, updateQuestionCountChars, resetQuestionCountChars] = useObjectState<
    Record<number, number>
  >({});
  const [questionSelectedOption, updateQuestionSelectedOption, resetQuestionSelectedOption] = useObjectState<
    Record<number, number[]>
  >({});
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [feedbackTags, { push, remove }] = useListState<string>([]);

  const {
    data: { status, questionsCount, exam, application, studentApplications } = {},
    revalidate,
    state,
  } = useRequest<SchemaRoute<typeof ApplicationGetSchema>>(applicationId && `/applications/${applicationId}`, {
    noCache: true,
    autoRevalidate: false,
  });

  const { data: feedback, revalidate: revalidateFeedback } = useRequest<
    SchemaRoute<typeof ApplicationFeedbackGetSchema>
  >(application?.id && `/applications/${application?.id}/feedback`, {
    noCache: true,
    autoRevalidate: false,
  });

  // priorize NOT SUBMITTED student application
  // then, get the one with higher student score
  const current = studentApplications?.reduce(
    (curr, prev) =>
      (!curr?.submittedAt && curr?.status !== StudentApplicationStatus.EXPIRED) ||
      curr?.status === StudentApplicationStatus.AWAITING_CORRECTION
        ? curr
        : number(curr?.studentScore) > number(prev.studentScore)
          ? curr
          : prev,
    studentApplications?.at(-1),
  );

  const isSubmitted = Boolean(current?.submittedAt);
  const isCorrected = isSubmitted && current?.questions?.every((question) => typeof question.studentScore === 'number');
  const hasMinScore = number(exam?.minScore) > 0;
  const limitTimeAt = add(isoUtcToLocal(current?.startedAt), { minutes: number(application?.limitTime) });
  const isExpired = number(application?.limitTime) > 0 && limitTimeAt < new Date();
  const attemptsLeft = number(application?.attempts) - number(studentApplications?.length);

  useEffect(() => {
    if (!application?.limitTime) return;
    if (isSubmitted) return;

    const interval = setInterval(() => {
      const formatted = formatDuration(
        {
          minutes: 0,
          seconds: 0,
          ...intervalToDuration({
            start: new Date(),
            end: limitTimeAt,
          }),
          ...{
            hours: differenceInHours(limitTimeAt, new Date()) || undefined,
          },
        },
        {
          zero: true,
          delimiter: ',',
          format: ['hours', 'minutes', 'seconds'],
        },
      );

      const timer = formatted
        .split(',')
        .slice(-3)
        .map((item) => item.replace(/\D/g, '').padStart(2, '0'))
        .join(':');

      setTimer(timer);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [application?.limitTime, limitTimeAt, isSubmitted]);

  const handleNewAttempt = async () => {
    // reset states
    setTimer(undefined);
    resetQuestionCountChars();
    resetQuestionSelectedOption();

    try {
      await ApiStudent.post(`/applications/${applicationId}`);
      await revalidate();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  const handleChangeOption = (
    question: NonNullable<typeof current>['questions'][number],
    option: NonNullable<typeof current>['questions'][number]['questionOptions'][number],
    checked: boolean,
  ) => {
    let selected = questionSelectedOption[question.id] ?? [];

    // Single option
    if (number(question.correctOptionsCount) < 2) {
      updateQuestionSelectedOption({
        [question.id]: [option.id],
      });

      return;
    }

    // Multi option
    if (checked) {
      if (selected.length >= number(question.correctOptionsCount)) {
        toaster.warning('Você já selecionou o limite de opções desta questão');
        return;
      }

      if (!selected.includes(option.id)) {
        selected.push(option.id);
      }
    } else {
      selected = selected.filter((optionId) => optionId !== option.id);
    }

    updateQuestionSelectedOption({
      [question.id]: selected,
    });
  };

  const handleBackupExam = async (e: RbkFormEvent, data: AnyObject) => {
    if (isSubmitted) return;
    if (isExpired) return;

    if (backupTimeoutRef.current) {
      clearTimeout(backupTimeoutRef.current);
    }

    backupTimeoutRef.current = setTimeout(async () => {
      data.temp = true;
      data.answers = data.answers.filter(({ answer }: any) => answer !== undefined);

      try {
        await ApiStudent.put(`/applications/${applicationId}`, data);
      } catch {}
    }, 2000);
  };

  const handleSubmitExam = async (e: RbkFormEvent, data: AnyObject) => {
    if (backupTimeoutRef.current) {
      clearTimeout(backupTimeoutRef.current);
    }

    try {
      await ApiStudent.put(`/applications/${applicationId}`, data);
      await revalidate();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  const handleSubmitFeedback = async (e: RbkFormEvent, data: AnyObject) => {
    data.examId = exam?.id;
    data.feedback = feedbackTags;

    if (!feedbackTags?.length && !string(data.descriptionFeedback).trim()) {
      return e.form.setErrors({
        descriptionFeedback: 'Para enviar seu feedback, selecione uma opção ou preencha o campo de sugestão.',
      });
    }

    try {
      await ApiStudent.post(`/applications/${applicationId}/feedback`, data);
      await revalidateFeedback();
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  return (
    <>
      <State {...state}>
        {!current?.startedAt && (
          <Box center flex>
            <Card maxw={480} p="2gap">
              <Text variant="title">{exam?.title}</Text>

              {Boolean(exam?.description) && <Html html={exam?.description} mt="1gap" />}

              <Card noWrap row alignItems="center" bg="gray.lighter" mt="2gap" p={0} shadow={0}>
                <Box center bg="primary" corners={2} minh={40} minw={40} p={2}>
                  <Text bold color="white">
                    {exam?.maxScore}
                  </Text>
                </Box>
                <Text mx="1gap">Pontuação total da avaliação</Text>
              </Card>

              {hasMinScore && (
                <Card noWrap row alignItems="center" bg="gray.lighter" mt="1gap" p={0} shadow={0}>
                  <Box center bg="success" corners={2} minh={40} minw={40} p={2}>
                    <Text bold color="white">
                      {exam?.minScore}
                    </Text>
                  </Box>
                  <Text mx="1gap">Pontuação para aprovação</Text>
                </Card>
              )}

              <Box my="2gap">
                <ul>
                  {questionsCount ? (
                    <li>
                      <Text weight="600">
                        Esta avaliação é composta por {questionsCount}{' '}
                        {pluralize(questionsCount, 'questão', 'questões')}.
                      </Text>
                    </li>
                  ) : null}
                  {application?.limitTime ? (
                    <li>
                      <Text weight="600">
                        O tempo para concluir a avaliação é de{' '}
                        {distance(new Date(), add(new Date(), { minutes: application?.limitTime }))}.
                      </Text>
                    </li>
                  ) : null}
                  <li>
                    <Text weight="600">
                      {!attemptsLeft
                        ? 'Nenhuma tentativa restante.'
                        : `Você tem ${number(attemptsLeft)} ${pluralize(number(attemptsLeft), 'tentativa restante', 'tentativas restantes')}.`}
                    </Text>
                  </li>
                  {application?.showAnswers && (
                    <li>
                      <Text weight="600">Gabarito disponível após concluir.</Text>
                    </li>
                  )}
                </ul>
              </Box>

              {exam && application && status ? (
                <Box mb="2gap">
                  <ApplicationStatus
                    endedAt={application.endedAt}
                    limitTime={application.limitTime}
                    startedAt={application.startedAt}
                    status={status}
                  />
                </Box>
              ) : null}

              {status === StudentApplicationStatus.STARTED ? (
                <Button size="large" onPress={handleNewAttempt}>
                  Iniciar Prova
                </Button>
              ) : exam && application && status ? (
                <ApplicationActions
                  applicationId={application.id}
                  startedAt={application.startedAt}
                  status={status}
                  title={exam.title}
                />
              ) : null}
            </Card>
          </Box>
        )}

        {current?.startedAt && exam && (
          <Form p="1gap" onChange={handleBackupExam} onSubmit={handleSubmitExam}>
            <Text variant="title">{exam?.title}</Text>

            {Boolean(exam?.description) && <Html html={exam?.description} mt="1gap" />}

            {application?.limitTime && timer && !isSubmitted ? (
              <Box b="1gap" position="fixed" r="1gap" zIndex={10}>
                {isExpired ? (
                  <Card center noWrap row bg="error">
                    <Icon color="white" name="Clock" size={20} weight="bold" />
                    <Text bold flex color="white" ml="0.5gap">
                      Tempo esgotado
                    </Text>
                  </Card>
                ) : (
                  <Tooltip title="Tempo restante">
                    <Card center noWrap row>
                      <Icon name="Clock" size={20} weight="bold" />
                      <Text bold flex color="primary" ml="0.5gap">
                        {timer}
                      </Text>
                    </Card>
                  </Tooltip>
                )}
              </Box>
            ) : null}

            {isSubmitted && !isCorrected && (
              <Card bg="warning.main.25" border="warning.darker" mt="1gap" shadow={0}>
                <Text color="warning.darker" weight="bold">
                  Respostas enviadas em {format(current.submittedAt, true)}.
                </Text>
                <Text color="warning.darker" mt={1} weight="bold">
                  Aguardando correção.
                </Text>
              </Card>
            )}

            {isCorrected && (
              <Card mt="1gap" p="2gap">
                <Grid center gap={2}>
                  <Box md="auto" xs={12}>
                    <Box my="-4gap" style={{ md: { w: 320 } }}>
                      <Pie
                        data={{
                          labels: ['Corretas', 'Parciais', 'Incorretas'],
                          datasets: [
                            {
                              data: [
                                current.questions.filter(({ correctionStatus }) => correctionStatus === 'correct')
                                  .length,
                                current.questions.filter(({ correctionStatus }) => correctionStatus === 'partial')
                                  .length,
                                current.questions.filter(({ correctionStatus }) => correctionStatus === 'incorrect')
                                  .length,
                              ],
                              backgroundColor: [
                                theme.color(CORRECTION_STATUS_COLOR['correct']),
                                theme.color(CORRECTION_STATUS_COLOR['partial']),
                                theme.color(CORRECTION_STATUS_COLOR['incorrect']),
                              ],
                              hoverOffset: 4,
                            },
                          ],
                        }}
                        options={{
                          plugins: {
                            legend: { position: 'right' },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                  <Box md xs={12}>
                    <Card noWrap row alignItems="center" bg="gray.lighter" p={0} shadow={0}>
                      <Box
                        center
                        bg={number(current.studentScore) < exam.minScore ? 'error' : 'success'}
                        corners={2}
                        minh={40}
                        minw={40}
                        p={2}
                      >
                        <Text bold color="white">
                          {current.studentScore}
                        </Text>
                      </Box>
                      <Text mx="1gap">Pontuação obtida</Text>
                      {hasMinScore && (
                        <Badge color={number(current.studentScore) < exam.minScore ? 'error' : 'success'} size={3}>
                          {number(current.studentScore) < exam.minScore ? 'Insuficiente' : 'Aprovado'}
                        </Badge>
                      )}
                    </Card>
                    <Card noWrap row alignItems="center" bg="gray.lighter" mt="1gap" p={0} shadow={0}>
                      <Box center bg="gray" corners={2} minh={40} minw={40} p={2}>
                        <Text bold color="white">
                          {exam?.maxScore}
                        </Text>
                      </Box>
                      <Text mx="1gap">Pontuação total da avaliação</Text>
                    </Card>
                    {number(exam?.minScore) > 0 && (
                      <Card noWrap row alignItems="center" bg="gray.lighter" mt="1gap" p={0} shadow={0}>
                        <Box center bg="gray" corners={2} minh={40} minw={40} p={2}>
                          <Text bold color="white">
                            {exam?.minScore}
                          </Text>
                        </Box>
                        <Text mx="1gap">Pontuação para aprovação</Text>
                      </Card>
                    )}
                    <Card noWrap row alignItems="center" bg="gray.lighter" mt="1gap" p={0} shadow={0}>
                      <Box center bg="gray.light" corners={2} minh={40} minw={40}>
                        {/*<Icon color="white" name="CalendarBlank" />*/}
                        <Badge color="gray.lighter" size={1.5} />
                      </Box>
                      <Text mx="1gap">
                        Iniciado em <Text bold>{format(current.startedAt, true)}</Text>
                      </Text>
                    </Card>
                    {current.submittedAt && (
                      <>
                        <Box
                          h="3gap"
                          ml="19px"
                          my="-1gap"
                          w={2}
                          zIndex={2}
                          style={{
                            background: `linear-gradient(180deg, ${theme.color('gray.lighter')} 0%, ${theme.color('gray.main')} 100%)`,
                          }}
                        />
                        <Card noWrap row alignItems="center" bg="gray.lighter" p={0} shadow={0}>
                          <Box center bg="gray.light" corners={2} minh={40} minw={40}>
                            {/*<Icon color="white" name="CalendarBlank" />*/}
                            <Badge color="gray.main" size={1.5} />
                          </Box>
                          <Text mx="1gap">
                            Finalizado em <Text bold>{format(current.submittedAt, true)}</Text>
                          </Text>
                        </Card>
                      </>
                    )}

                    {attemptsLeft > 0 && (
                      <Card noWrap row alignItems="center" bg="gray.lighter" mt="1gap" p={0} shadow={0}>
                        <Box center bg="gray" corners={2} minh={40} minw={40} p={2}>
                          <Text bold color="white">
                            {attemptsLeft}
                          </Text>
                        </Box>
                        <Text mx="1gap">{pluralize(attemptsLeft, 'Tentativa restante', 'Tentativas restantes')}</Text>
                      </Card>
                    )}

                    {attemptsLeft > 0 && (
                      <Box align="start" mt="1gap">
                        <Button corners={2} size="large" onPress={handleNewAttempt}>
                          Tentar novamente
                        </Button>
                      </Box>
                    )}

                    {application?.allowFeedback && Boolean(feedback) && (
                      <>
                        {feedback?.sent ? (
                          <Card noWrap row alignItems="center" bg="gray.lighter" mt="1gap" p={0} shadow={0}>
                            <Box center bg="gray.light" corners={2} minh={40} minw={40} p={2}>
                              <Icon color="yellow" name="Star" weight="fill" />
                            </Box>
                            <Text mx="1gap">Agradecemos seu feedback!</Text>
                          </Card>
                        ) : (
                          <Box mt="1gap">
                            <Box align="start" position="relative">
                              <Button
                                color="warning.dark"
                                corners={2}
                                labelStyle={{ color: '#4D3A01' }}
                                overflow="hidden"
                                shadow={1}
                                size="large"
                                startAddon={() => <Icon color="#4D3A01" name="Star" weight="fill" />}
                                style={{
                                  transition: 'all ease 0.3s',
                                  borderColor: 'transparent',
                                  background: 'linear-gradient(to right, #FDE08D, #E0A63A, #FDE08D)',
                                  '&:hover': { scale: 1.02 },
                                }}
                                onPress={() => setIsFeedbackModalVisible(true)}
                              >
                                Enviar Feedback da Avaliação
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </Grid>
              </Card>
            )}

            {current.questions.map((question, index) => {
              const charCount = number(questionCountChars[question.id]);
              const charPercent = Math.round((charCount / (question.maxLength ?? 1)) * 100);

              const selected = array(
                questionSelectedOption[question.id] ?? string(question.answer).split(',').map(number),
              );

              const correctOptions = question.questionOptions.filter(({ isCorrect }) => isCorrect).map(({ id }) => id);

              return (
                <Box key={question.id}>
                  <Input name={`answers.${index}.questionId`} type="hidden" value={question.id} />

                  <Divider mx="-2gap" my="2gap" />

                  <Box row alignItems="center" g={0.5} my="1gap">
                    <Text mr="0.5gap" variant="secondary" weight="600">
                      Questão {index + 1}.
                    </Text>

                    {isCorrected && (
                      <>
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

                        {application?.showScores && (
                          <Badge color="info" size={3}>
                            Nota {number(question.studentScore)}
                            {question.studentScore !== question.questionScore && ` de ${question.questionScore}`}
                          </Badge>
                        )}
                      </>
                    )}
                  </Box>

                  <Card
                    shadow={0}
                    bg={
                      isCorrected && question.correctionStatus
                        ? `${CORRECTION_STATUS_COLOR[question.correctionStatus]}.main.5`
                        : 'background'
                    }
                    border={
                      isCorrected && question.correctionStatus
                        ? `${CORRECTION_STATUS_COLOR[question.correctionStatus]}`
                        : 'gray.lighter'
                    }
                  >
                    <Html html={question.description} mb="1gap" />

                    {isSubmitted && Boolean(question.feedback) && (
                      <Box bg="gray.main.15" corners={4} mb="1gap" p="1gap" pb={0}>
                        <Text color="info.dark" mb="0.5gap" variant="secondary" weight="600">
                          Feedback da correção:
                        </Text>
                        <Html html={question.feedback} mb="1gap" />
                      </Box>
                    )}

                    {question.type === QuestionType.DISCURSIVE && (
                      <>
                        {!isSubmitted && number(question.maxLength) > 0 && (
                          <Text color="warning" mb="0.5gap" variant="secondary" weight="600">
                            Limite de caracteres: {question.maxLength}.
                          </Text>
                        )}

                        <Text color="info.darker" mb="0.5gap" variant="secondary" weight="600">
                          Resposta:
                        </Text>

                        <Input
                          multiline
                          disabled={isSubmitted || isExpired}
                          maxLength={question.maxLength || undefined}
                          name={`answers.${index}.answer`}
                          value={question.answer}
                          onChange={(_, value) => updateQuestionCountChars({ [question.id]: string(value).length })}
                        />

                        {!isSubmitted && number(question.maxLength) > 0 && (
                          <Text
                            right
                            color={charPercent > 90 ? 'error' : charPercent > 60 ? 'warning' : 'text'}
                            mt="0.5gap"
                            variant="caption"
                            weight="600"
                          >
                            {charCount}/{question.maxLength}
                          </Text>
                        )}
                      </>
                    )}

                    {question.type === QuestionType.OPTIONS && (
                      <>
                        <Input name={`answers.${index}.answer`} type="hidden" value={selected.join(',')} />

                        {!isSubmitted && number(question.correctOptionsCount) > 1 && (
                          <Text color="warning" variant="secondary" weight="600">
                            Selecione {question.correctOptionsCount} opções.
                          </Text>
                        )}

                        {isCorrected && number(question.correctOptionsCount) > 1 && (
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
                                {isCorrected && application?.showAnswers && (
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
                                )}
                                <Box w={32}>
                                  <Text center variant="secondary" weight="600">
                                    {String.fromCharCode((optionIndex % 26) + 65)}
                                  </Text>
                                </Box>
                                <Box align="stretch">
                                  <Divider vertical h="100%" />
                                </Box>
                                {!isCorrected && (
                                  <Box>
                                    <Checkbox
                                      controlled
                                      checked={isOptionSelected}
                                      disabled={isSubmitted || isExpired}
                                      my="-0.6gap"
                                      unique={number(question.correctOptionsCount) === 1}
                                      onChange={(_, checked) => handleChangeOption(question, option, checked)}
                                    />
                                  </Box>
                                )}
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

            {!isSubmitted && !isExpired && (
              <>
                <Divider mx="-2gap" my="2gap" />

                <Button align="end" type="submit">
                  Enviar Respostas
                </Button>
              </>
            )}

            {Boolean(timer) && !isSubmitted && <Box p="2gap" />}
          </Form>
        )}
      </State>

      <Modal maxw={400} p="2gap" visible={isFeedbackModalVisible}>
        <Form onSubmit={handleSubmitFeedback}>
          {feedback?.sent ? (
            <Box center>
              <Icon color="success" name="CheckCircle" size={120} />
              <Text center mt="1gap" variant="title">
                Agradecemos o seu
              </Text>
              <Text center variant="title">
                Feedback!
              </Text>

              <Button corners={2} mt="2gap" onPress={() => setIsFeedbackModalVisible(false)}>
                Fechar
              </Button>
            </Box>
          ) : (
            <>
              <Text center variant="title">
                Feedback da Avaliação
              </Text>
              <Text center mt="1gap" variant="caption">
                Selecione o que você achou positivo:
              </Text>

              <Grid center gap={0.5} mt="1gap">
                {['Primeira Impressão', 'Instruções da Avaliação', 'Clareza das Informações', 'Satisfação Geral'].map(
                  (tag, index) => {
                    const isActive = feedbackTags.includes(tag);

                    return (
                      <Box key={index}>
                        <Badge
                          color={isActive ? 'primary' : 'gray.main.15'}
                          labelStyle={{ color: isActive ? 'white' : 'gray.main' }}
                          size={3}
                          onPress={() => (isActive ? remove((item) => item === tag) : push(tag))}
                        >
                          {tag}
                        </Badge>
                      </Box>
                    );
                  },
                )}
              </Grid>

              <Input multiline mt="2gap" name="descriptionFeedback" placeholder="Deixe aqui sua sugestão" rows={3} />

              <Box mt="2gap" mx="4gap">
                <Button
                  color="warning.dark"
                  corners={2}
                  labelStyle={{ color: '#4D3A01' }}
                  overflow="hidden"
                  size="large"
                  type="submit"
                  style={{
                    transition: 'all ease 0.3s',
                    borderColor: 'transparent',
                    background: 'linear-gradient(to right, #FDE08D, #E0A63A, #FDE08D)',
                  }}
                >
                  Enviar Feedback
                </Button>

                <Button
                  color="gray"
                  corners={2}
                  mt="0.5gap"
                  size="small"
                  variant="text"
                  onPress={() => setIsFeedbackModalVisible(false)}
                >
                  Cancelar
                </Button>
              </Box>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
}
