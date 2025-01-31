import { MODULE } from '@prova-livre/frontend/constants/module.constant';
import { Box, Image, Text } from '@react-bulk/web';

export default function Logo() {
  return (
    <>
      <Box row alignItems="end">
        <Image alt="logo" source="/favicon.ico" w={18} />
        <Text color="primary" fontSize="16px" lineHeight={1} ml={1} weight="700">
          rova Livre
        </Text>
      </Box>
      {MODULE === 'admin' ? (
        <Text color="warning.dark" fontSize="12px" mt="0.5gap" weight="bold">
          Área Administrativa
        </Text>
      ) : (
        <Text color="primary.light" fontSize="12px" mt="0.5gap" weight="bold">
          Área do Estudante
        </Text>
      )}
    </>
  );
}
