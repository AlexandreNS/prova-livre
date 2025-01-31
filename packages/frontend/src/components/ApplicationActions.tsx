import type { ObjectValues } from '@prova-livre/shared/types/util.type';

import Icon from '@prova-livre/frontend/components/Icon';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import { StudentApplicationStatus } from '@prova-livre/shared/constants/StudentApplicationStatus';
import { format } from '@prova-livre/shared/helpers/date.helper';
import { Box, Button, Text } from '@react-bulk/web';
import { AddToCalendarButton } from 'add-to-calendar-button-react';

export type ApplicationActionsProps = {
  applicationId: number;
  startedAt: string;
  status?: ObjectValues<typeof StudentApplicationStatus>;
  title: string;
};

export default function ApplicationActions({ applicationId, startedAt, status, title }: ApplicationActionsProps) {
  return (
    <>
      {status === StudentApplicationStatus.WAITING && (
        <Box
          onPress={() => {
            const atcbEl = document.querySelector('#atcb-btn-1-modal-host')?.shadowRoot;
            // @ts-ignore
            if (atcbEl?.querySelector('#atcb-reference')?.style) {
              // @ts-ignore
              atcbEl.querySelector('#atcb-reference').style.display = 'none';
            }
          }}
        >
          <AddToCalendarButton
            forceOverlay
            language="pt"
            name={title}
            options={['Google', 'Apple', 'Outlook.com', 'Microsoft365', 'MicrosoftTeams', 'Yahoo']}
            size="2"
            startDate={format(startedAt, 'yyyy-MM-dd')}
            trigger="click"
          />
        </Box>
      )}
      {status === StudentApplicationStatus.ENDED && (
        <Box row p="0.5gap">
          <Icon color="warning" name="WarningCircle" size={20} weight="bold" />
          <Box flex ml="0.5gap">
            <Text color="warning" weight="500">
              Avaliação não foi iniciada
            </Text>
          </Box>
        </Box>
      )}

      {status !== StudentApplicationStatus.WAITING && status !== StudentApplicationStatus.ENDED && (
        <LinkChild href={`/applications/${applicationId}`}>
          <Button
            variant={
              status === StudentApplicationStatus.INITIALIZED || status === StudentApplicationStatus.STARTED
                ? 'solid'
                : 'outline'
            }
          >
            {status === StudentApplicationStatus.INITIALIZED
              ? 'Continuar'
              : status === StudentApplicationStatus.STARTED
                ? 'Ver Instruções'
                : 'Ver Avaliação'}
          </Button>
        </LinkChild>
      )}
    </>
  );
}
