import { useTheme } from '@react-bulk/core';
import { Box, Card, Grid, Text } from '@react-bulk/web';

export default function Page() {
  const theme = useTheme();

  return (
    <>
      <Grid gap>
        <Box lg={4} sm={6} xl={3} xs={12} xxl={2}>
          <Card flex>
            <Text mb="1gap" variant="subtitle">
              Bem vindo
            </Text>
          </Card>
        </Box>
      </Grid>
    </>
  );
}
