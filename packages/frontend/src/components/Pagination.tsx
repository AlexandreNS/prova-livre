import { number } from '@prova-livre/shared/helpers/number.helper';
import { pluralize } from '@prova-livre/shared/helpers/string.helper';
import { string } from '@react-bulk/core';
import { Box, Button, Divider, Grid, Select, Text } from '@react-bulk/web';

export type PaginationProps = {
  inline?: boolean;
  limit?: number;
  onChange?: (data: { limit?: number; page: number }) => void;
  page?: number;
  pages?: number;
  plural?: string;
  singular?: string;
  total?: number;
};

// TODO: limitar numero de paginas exibidas
export default function Pagination({
  page,
  pages,
  total,
  limit,
  inline,
  singular = 'registro',
  plural = 'registros',
  onChange,
}: PaginationProps) {
  page = number(page);
  pages = number(pages);
  total = number(total);
  limit = number(limit);

  return (
    <Box style={!inline && { position: 'sticky', b: 0, m: '-1gap', mt: 'auto' }}>
      {!inline && <Divider mt="1gap" />}

      <Box center row style={!inline && { bg: 'background', p: 2 }}>
        <Text variant="secondary">
          {!total ? `Nenhum ${singular}` : `${total} ${pluralize(total, singular, plural)} no total`}
        </Text>
        <Box flex>
          {pages > 1 && (
            <Grid center gap={0.5}>
              {Array.from({ length: pages }).map((_, index) => {
                return (
                  <Box key={index}>
                    <Button
                      size="small"
                      variant={index + 1 === page ? 'solid' : 'outline'}
                      onPress={() => onChange?.({ page: index + 1 })}
                    >
                      {index + 1}
                    </Button>
                  </Box>
                );
              })}
            </Grid>
          )}
        </Box>
        <Text mr={2} variant="secondary">
          Por página:
        </Text>
        <Box>
          <Select
            size="small"
            value={limit}
            w={70}
            options={[10, 20, 50, 200].map((value) => ({
              value,
              label: string(value),
            }))}
            onChange={(_, limit) => onChange?.({ page: 1, limit })}
          />
        </Box>
      </Box>
    </Box>
  );
}
