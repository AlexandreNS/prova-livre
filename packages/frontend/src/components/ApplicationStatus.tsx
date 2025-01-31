import type { ObjectValues } from '@prova-livre/shared/types/util.type';

import { StudentApplicationStatus } from '@prova-livre/shared/constants/StudentApplicationStatus';
import { format, humanize } from '@prova-livre/shared/helpers/date.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { Text } from '@react-bulk/web';
import { formatDuration } from 'date-fns';

export type ApplicationStatusProps = {
  endedAt: string;
  limitTime: null | number;
  startedAt: string;
  status?: ObjectValues<typeof StudentApplicationStatus>;
  submittedAt?: null | string;
};

export default function ApplicationStatus({
  endedAt,
  startedAt,
  submittedAt,
  limitTime,
  status,
}: ApplicationStatusProps) {
  return (
    <>
      {status === StudentApplicationStatus.WAITING && <Text weight="600">Disponível em {format(startedAt, true)}</Text>}
      {(status === StudentApplicationStatus.STARTED || status === StudentApplicationStatus.INITIALIZED) && (
        <Text weight="600">Encerra em {humanize(endedAt)}</Text>
      )}
      {(status === StudentApplicationStatus.SUBMITTED || status === StudentApplicationStatus.AWAITING_CORRECTION) && (
        <Text weight="600">Enviado em {humanize(submittedAt)}</Text>
      )}
      {status === StudentApplicationStatus.ENDED && <Text weight="600">Encerrada em {humanize(endedAt)}</Text>}
      {status === StudentApplicationStatus.EXPIRED && (
        <Text weight="600">Tempo limite excedido ({formatDuration({ minutes: number(limitTime) })})</Text>
      )}
    </>
  );
}
