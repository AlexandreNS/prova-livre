import type { InputValue, ReactElement, TabItem, TimeoutType } from '@react-bulk/core';

import { useEffect, useRef, useState } from 'react';

import Icon from '@prova-livre/frontend/components/Icon';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import { MODULE } from '@prova-livre/frontend/constants/module.constant';
import useTabMatch from '@prova-livre/frontend/hooks/useTabMatch';
import { Box, Button, Card, Grid, Input, Scrollable, Text, Tooltip } from '@react-bulk/web';

export type PageHeaderProps = {
  children?: ReactElement;
  onSearch?: (value: InputValue) => void;
  subtitle?: string;
  tabs?: (TabItem | boolean | null | undefined)[];
  title: string;
};

export default function PageHeader({ tabs, title, subtitle, children, onSearch }: PageHeaderProps) {
  const { tabURL, tabValue } = useTabMatch();

  const inputSearchRef = useRef<HTMLInputElement>();
  const searchTimeoutRef = useRef<TimeoutType>();

  const [search, setSearch] = useState<null | string>();

  const hasHistory = window.history.length > 1;
  const backURL = tabURL.split('/').slice(0, -1).join('/');
  const hasBackButton = MODULE === 'admin' ? backURL !== '/admin' : !!backURL;

  const filteredTabs = (tabs ?? []).filter(Boolean) as TabItem[];

  useEffect(() => {
    if (!onSearch) return;

    function shortcut(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'k' && e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        inputSearchRef.current?.focus();
      }
    }

    document.addEventListener('keydown', shortcut);

    return () => {
      document.removeEventListener('keydown', shortcut);
    };

    // onSearch causa loop infinito se nao memoizado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof search === 'undefined') return;

    searchTimeoutRef.current = setTimeout(
      () => {
        onSearch?.(search || undefined);
      },
      search ? 500 : 0,
    );

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };

    // onSearch causa loop infinito se nao memoizado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <Card corners={0} m="-1gap" mb={0} position="sticky" t={0} zIndex={4}>
      <Grid row alignItems="center" gap={0.5}>
        {hasBackButton && (
          <Box ml={-3}>
            <Tooltip title="Voltar">
              <LinkChild href={!hasHistory ? backURL : undefined}>
                <Button
                  circular
                  startAddon={({ color }) => <Icon color={color} name="CaretLeft" />}
                  variant="text"
                  onPress={hasHistory ? () => window.history.back() : undefined}
                />
              </LinkChild>
            </Tooltip>
          </Box>
        )}

        <Box mr="auto">
          <Text variant="title">{title}</Text>
          {subtitle && (
            <Text mt={1} variant="caption">
              {subtitle}
            </Text>
          )}
        </Box>

        {typeof onSearch === 'function' && (
          <Box
            style={{
              xs: { order: 1, width: '100%' },
              md: { order: 0, width: 'auto' },
            }}
          >
            <Input
              ref={inputSearchRef}
              placeholder="Buscar... [CTRL+K]"
              value={search}
              endAddon={
                search ? (
                  <Box onPress={() => setSearch(null)}>
                    <Icon color="primary" name="X" weight="bold" />
                  </Box>
                ) : (
                  <Icon color="primary" name="MagnifyingGlass" weight="bold" />
                )
              }
              onChange={(_, value) => setSearch(value)}
            />
          </Box>
        )}

        {children && (
          <Box noWrap row g="0.5gap">
            {children}
          </Box>
        )}
      </Grid>

      {filteredTabs.length > 1 && (
        <Box xs={12}>
          <Scrollable
            contentInset={{ horizontal: 2, vertical: '0.25gap' }}
            direction="horizontal"
            mb="-1.25gap"
            mt="0.5gap"
            mx="-0.5gap"
          >
            {filteredTabs.map((tab, index) => {
              const isActive = tabValue === tab.value;

              return (
                <LinkChild key={index} replace href={tab.disabled ? '' : `${tabURL}/${tab.value}`}>
                  <Button
                    borderBottom={`3px solid ${isActive ? 'primary' : 'trans'}`}
                    borderBottomLeftRadius={0}
                    borderBottomRightRadius={0}
                    disabled={tab.disabled}
                    labelStyle={{ color: isActive ? 'primary' : 'text' }}
                    mx={1}
                    size="large"
                    variant="text"
                  >
                    {tab.label}
                  </Button>
                </LinkChild>
              );
            })}
          </Scrollable>
        </Box>
      )}
    </Card>
  );
}
