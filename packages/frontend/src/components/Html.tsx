import type { BoxProps } from '@react-bulk/core';

import { Box } from '@react-bulk/web';

export type HtmlProps = {
  html: null | string | undefined;
} & BoxProps<false>;

export default function Html({ component = 'div', html, style, ...rest }: HtmlProps) {
  if (!html) {
    return null;
  }

  style = [
    {
      overflowWrap: 'break-word',
      '& img': { maxWidth: '100%' },
      '& p': {
        margin: 0,
        '&:not(:last-child)': {
          marginBottom: '1gap',
        },
      },
    },

    style,
  ];

  return <Box component={component} dangerouslySetInnerHTML={{ __html: html }} maxw="100%" style={style} {...rest} />;
}
