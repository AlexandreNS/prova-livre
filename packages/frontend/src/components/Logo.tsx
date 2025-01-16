import { clamp } from '@prova-livre/shared/helpers/number.helper';
import { Text } from '@react-bulk/web';

export type LogoProps = {
  size?: number;
};

export default function Logo({ size = 32 }: LogoProps) {
  return (
    <Text
      color="primary"
      // fontSize={size}
      // letterSpacing={size / 3}
      lineHeight={1}
      weight={`${clamp(Math.round((size * 26) / 100) * 100, 100, 900)}`}
    >
      Prova Livre
    </Text>
  );
}
