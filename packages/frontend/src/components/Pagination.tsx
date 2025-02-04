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

  const maxButtons = 3;

  const startPage = Math.max(2, page - Math.floor(maxButtons / 2)); // Começa da página 2 (mantemos sempre a página 1)
  const endPage = Math.min(pages - 1, startPage + maxButtons - 1); // Mantemos sempre a última página

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
              <Box key={1}>
                <Button size="small" variant={page === 1 ? 'solid' : 'outline'} onPress={() => onChange?.({ page: 1 })}>
                  1
                </Button>
              </Box>

              {startPage > 2 && (
                <Box>
                  <Text>...</Text>
                </Box>
              )}

              {/* Páginas intermediárias */}
              {Array.from({ length: endPage - startPage + 1 }).map((_, index) => {
                const pageNumber = startPage + index;
                return (
                  <Box key={pageNumber}>
                    <Button
                      size="small"
                      variant={pageNumber === page ? 'solid' : 'outline'}
                      onPress={() => onChange?.({ page: pageNumber })}
                    >
                      {pageNumber}
                    </Button>
                  </Box>
                );
              })}

              {endPage < pages - 1 && (
                <Box>
                  <Text>...</Text>
                </Box>
              )}

              <Box key={pages}>
                <Button
                  size="small"
                  variant={page === pages ? 'solid' : 'outline'}
                  onPress={() => onChange?.({ page: pages })}
                >
                  {pages}
                </Button>
              </Box>
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
