import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import ApplicationActions from '@prova-livre/frontend/components/ApplicationActions';
import ApplicationStatus from '@prova-livre/frontend/components/ApplicationStatus';
import Icon from '@prova-livre/frontend/components/Icon';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import useQueryParams from '@prova-livre/frontend/hooks/useQueryParams';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { StudentApplicationStatus } from '@prova-livre/shared/constants/StudentApplicationStatus';
import { ApplicationListSchema } from '@prova-livre/shared/dtos/student/application/application.dto';
import { groupBy, orderBy } from '@prova-livre/shared/helpers/array.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { Box, Button, Card, Divider, Grid, Text } from '@react-bulk/web';

export default function Page() {
  const [params, updateParams] = useQueryParams<{ status?: string }>({});

  const { data: examApplications } = useRequest<SchemaRoute<typeof ApplicationListSchema>>('/applications');

  const statuses = [
    { value: undefined, color: 'warning', group: '0-Todas' },
    { value: StudentApplicationStatus.INITIALIZED, color: 'warning', group: '1-Em Progresso' },
    { value: StudentApplicationStatus.STARTED, color: 'info', group: '2-Liberadas' },
    { value: StudentApplicationStatus.AWAITING_CORRECTION, color: 'info', group: '3-Aguardando Correção' },
    { value: StudentApplicationStatus.SUBMITTED, color: 'success', group: '4-Concluídas' },
    { value: StudentApplicationStatus.WAITING, color: 'gray', group: '5-Próximas' },
    { value: StudentApplicationStatus.EXPIRED, color: 'error', group: '6-Tempo Excedido' },
    { value: StudentApplicationStatus.ENDED, color: 'error', group: '7-Prazo Encerrado' },
  ];

  const groups = groupBy(
    orderBy(
      (examApplications ?? [])
        .filter(({ status }) => !params.status || params.status === status)
        .map((item) => ({
          ...item,
          ...statuses.find(({ value }) => value === item.status),
        })),
      'group',
    ),
    'group',
    'color',
  );

  return (
    <>
      <PageHeader title="Minhas Avaliações" />
      <Card mt="0.5gap">
        <Text bold variant="primary">
          Filtrar por:
        </Text>
        <Box align="start" bg="gray.main.15" corners={4} my="0.5gap">
          <Grid gap={0.5}>
            {statuses.map((status, index) => {
              const isActive = params.status === status.value;

              if (status.value && !examApplications?.find((item) => item.status === status.value)) {
                return null;
              }

              return (
                <Box key={index}>
                  <Button
                    circular
                    color="primary"
                    px={4}
                    size="small"
                    variant={isActive ? 'solid' : 'text'}
                    onPress={() => updateParams({ status: status.value })}
                  >
                    {status.group.substring(2)}
                  </Button>
                </Box>
              );
            })}
          </Grid>
        </Box>
      </Card>

      {groups.map(({ data, key, title: color }, groupIndex) => (
        <Box key={key} mt="1gap">
          {groupIndex > 0 && <Divider mx="-1gap" my="1gap" />}

          <Box row alignItems="center" gap="0.5gap">
            <Icon color={color} name="Circle" weight="fill" />
            <Text variant="subtitle">{key.substring(2)}</Text>
          </Box>

          <Grid gap ml="1gap" mt="1gap">
            {data.map(({ exam, application, studentApplications, status }, index) => {
              const studentApplication = studentApplications?.reduce(
                (curr, prev) =>
                  (!curr?.submittedAt && curr?.status !== StudentApplicationStatus.EXPIRED) ||
                  curr.status === StudentApplicationStatus.AWAITING_CORRECTION
                    ? curr
                    : number(curr?.studentScore) > number(prev.studentScore)
                      ? curr
                      : prev,
                studentApplications?.at(-1),
              );

              return (
                <Box key={index} lg={4} md={6} xl={3} xs={12}>
                  <Card flex>
                    <Text variant="subtitle">{exam.title}</Text>

                    <Box mt="0.5gap">
                      <ApplicationStatus
                        endedAt={application.endedAt}
                        limitTime={application.limitTime}
                        startedAt={application.startedAt}
                        status={studentApplication?.status || status}
                        submittedAt={studentApplication?.submittedAt}
                      />
                    </Box>

                    <Box m="-0.5gap" mt="auto">
                      <Divider mb="0.5gap" mt="1gap" mx="-0.5gap" />

                      <Box row justifyContent="end">
                        <ApplicationActions
                          applicationId={application.id}
                          startedAt={application.startedAt}
                          status={studentApplication?.status || status}
                          title={exam.title}
                        />
                      </Box>
                    </Box>
                  </Card>
                </Box>
              );
            })}
          </Grid>
        </Box>
      ))}
    </>
  );
}
