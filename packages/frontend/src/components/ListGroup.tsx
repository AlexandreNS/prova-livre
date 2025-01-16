import type { BoxProps, ReactElement } from '@react-bulk/core';

import { Fragment } from 'react';

import CopyButton from '@prova-livre/frontend/components/CopyButton';
import Html from '@prova-livre/frontend/components/Html';
import { string } from '@prova-livre/shared/helpers/string.helper';
import { Box, Card, Divider, Grid, Text } from '@react-bulk/web';

export type ListGroupProps = {
  breakAll?: boolean;
  data:
    | (
        | 'break'
        | ({
            copy?: string;
            label?: ReactElement | boolean;
            value?: ReactElement | boolean;
          } & BoxProps<false>)
      )[]
    | undefined;
  right?: ReactElement;
} & BoxProps<false>;

const Break = () => <Divider color="gray" mr="-1gap" />;

export default function ListGroup({ data = [], breakAll = false, right, ...rest }: ListGroupProps) {
  return (
    <Card noWrap row {...rest}>
      <Grid flex gap justifyContent="between">
        {data.map((item, index) => {
          if (item === 'break') {
            return (
              <Box key={index} xs={12}>
                <Break />
              </Box>
            );
          }

          const { label, value, copy, ...rest } = item;

          const isLabelText = ['number', 'string'].includes(typeof label);
          const isValueText = ['number', 'string'].includes(typeof value);

          const labelChild = typeof label === 'boolean' ? (label ? 'Sim' : 'Não') : isLabelText ? string(label) : label;
          const valueChild = typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : isValueText ? string(value) : value;

          return (
            <Fragment key={index}>
              {index > 0 && breakAll && (
                <Box xs={12}>
                  <Break />
                </Box>
              )}
              <Box {...rest} maxw="100%">
                {labelChild ? (
                  <>
                    {isLabelText ? (
                      <Text bold variant="secondary">
                        {labelChild}
                      </Text>
                    ) : (
                      labelChild
                    )}
                  </>
                ) : null}

                {valueChild ? (
                  <Box mt={0.5}>
                    {isValueText && valueChild != '-' ? (
                      <Box noWrap row>
                        <Html flexShrink={1} html={string(valueChild)} />
                        <CopyButton m={-1} ml={1} value={string(copy ?? valueChild)} />
                      </Box>
                    ) : (
                      valueChild
                    )}
                  </Box>
                ) : null}
              </Box>
            </Fragment>
          );
        })}
      </Grid>

      {right ? (
        <>
          <Divider vertical color="gray" mx="1gap" my="-0.5gap" />
          <Box>{right}</Box>
        </>
      ) : null}
    </Card>
  );
}
