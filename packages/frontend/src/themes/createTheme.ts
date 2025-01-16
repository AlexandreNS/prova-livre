import { type ThemeEditProps, deepmerge } from '@react-bulk/core';

export const variantRequired = {
  required: {
    true: {
      label: {
        '&:after': { content: "' ✱'" },
      },
    },
  },
};

const base: ThemeEditProps = {
  components: {
    Card: {
      defaultProps: {
        shadow: 4,
      },
    },
    Input: {
      variants: {
        ...variantRequired,
      },
    },
    InputDate: {
      variants: {
        ...variantRequired,
      },
    },
    Label: {
      defaultProps: {
        variant: 'secondary',
        ml: 0,
      },
      defaultStyles: {
        root: {
          fontWeight: '500',
        },
      },
    },
    ListItem: {
      defaultProps: {
        shadow: 0,
      },
    },
    Select: {
      variants: {
        ...variantRequired,
      },
    },
  },
};

export default function createTheme(theme: ThemeEditProps): ThemeEditProps {
  return deepmerge(base, theme);
}
