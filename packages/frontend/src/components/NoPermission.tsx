import type { BoxProps } from '@react-bulk/core';

import Icon from '@prova-livre/frontend/components/Icon';
import { Box, Text } from '@react-bulk/web';

export default function NoPermission(props: BoxProps) {
  return (
    <Box center flex p={4} {...props}>
      <Icon color="gray.light" name="Prohibit" size="6rem" />
      <Text center color="text.secondary" mt={6}>
        Sem permissão para o recurso.
      </Text>
    </Box>
  );
}
