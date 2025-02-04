import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import Html from '@prova-livre/frontend/components/Html';
import State from '@prova-livre/frontend/components/State';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { LoggerListSchema } from '@prova-livre/shared/dtos/admin/logger/logger.dto';
import { format, isoLocalToUtc } from '@prova-livre/shared/helpers/date.helper';
import { string } from '@prova-livre/shared/helpers/string.helper';
import { Card, Text } from '@react-bulk/web';

export default function Page() {
  const { data: logs, state } = useRequest<SchemaRoute<typeof LoggerListSchema>>('/logger');

  return (
    <>
      <State {...state}>
        {logs?.map(({ summary, ...log }, index) => (
          <Card
            key={index}
            bg={log.type === 'error' ? 'error.main.20' : log.type === 'warn' ? 'warning.main.20' : 'background'}
            mt="1gap"
            shadow={0}
          >
            <details>
              <summary>
                {format(isoLocalToUtc(log.timestamp), true)}
                {summary ? (
                  <Text mt={1} numberOfLines={1} weight="600">
                    {string(summary)}
                  </Text>
                ) : null}
              </summary>

              <pre
                style={{
                  fontSize: 12,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {summary ? <Html html={string(summary).replace(/\\n/g, '<br/>')} /> : null}

                <h2>Context:</h2>
                {JSON.stringify(log, null, 2)}
              </pre>
            </details>
          </Card>
        ))}
      </State>
    </>
  );
}
