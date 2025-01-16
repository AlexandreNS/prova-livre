import type { BoxProps, LoadingProps, ReactElement } from '@react-bulk/core';

import Icon, { type IconProps } from '@prova-livre/frontend/components/Icon';
import { Box, Button, Loading, Text } from '@react-bulk/web';

export type StateProps = {
  children?: ReactElement;
  empty?: boolean | string;
  emptyIcon?: IconProps['name'];
  error?: any | string;
  errorIcon?: IconProps['name'];
  loading?: LoadingProps | boolean;
  onRefresh?: (...args: any[]) => any;
} & BoxProps<false>;

export default function State({
  children,
  empty,
  emptyIcon = 'FolderOpen',
  error,
  errorIcon = 'SmileySad',
  loading,
  onRefresh,
  ...rest
}: StateProps) {
  if (loading) {
    return (
      <Box center flex p={4} {...rest}>
        <Loading size={1.5} {...(typeof loading === 'object' ? loading : {})} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box center flex p={4} {...rest}>
        <Icon color="gray.light" name={errorIcon} size="6rem" />
        <Text center color="text.secondary" mt={4}>
          {typeof error === 'string' ? error : 'Houve um erro inesperado'}
        </Text>
        {typeof onRefresh === 'function' && (
          <Button mt={4} size="small" variant="outline" onPress={onRefresh}>
            Tentar Novamente
          </Button>
        )}
      </Box>
    );
  }

  if (empty) {
    return (
      <Box center flex p={4} {...rest}>
        <Icon color="gray.light" name={emptyIcon} size="6rem" />
        <Text center color="text.secondary" mt={6}>
          {typeof empty === 'string' ? empty : 'Nada por aqui...'}
        </Text>
      </Box>
    );
  }

  return <>{children}</>;
}
