import { type RbkColor, type RbkStyle, jss, useTheme } from '@react-bulk/core';
import * as icons from 'phosphor-react';

export type IconProps = {
  color?: RbkColor;
  mirrored?: boolean;
  name: keyof Omit<typeof icons, 'IconContext' | 'IconProps'>;
  size?: number | string;
  style?: RbkStyle;
  weight?: 'bold' | 'duotone' | 'fill' | 'light' | 'regular' | 'thin';
};

/**
 * https://phosphoricons.com/
 */
export default function Icon({ name, color, mirrored, size, style, weight }: IconProps) {
  const theme = useTheme();

  if (typeof size === 'string' && size.endsWith('rem')) {
    size = theme.rem(Number(size.replace('rem', '')));
  }

  const Component = icons[name];

  return (
    <Component
      color={theme.color(color ?? 'primary')}
      mirrored={mirrored}
      size={size ?? theme.rem()}
      style={jss(style)}
      weight={weight ?? 'regular'}
    />
  );
}
