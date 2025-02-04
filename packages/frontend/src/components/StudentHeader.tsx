import type { AuthCompanySignSchema } from '@prova-livre/shared/dtos/student/auth/auth.dto';
import type { CompanyListSchema } from '@prova-livre/shared/dtos/student/company/company.dto';
import type { SchemaResponse, SchemaRoute } from '@prova-livre/shared/types/schema.type';

import { useEffect, useState } from 'react';

import Icon from '@prova-livre/frontend/components/Icon';
import LinkChild from '@prova-livre/frontend/components/LinkChild';
import Logo from '@prova-livre/frontend/components/Logo';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useLayout from '@prova-livre/frontend/hooks/useLayout';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import useStudentAuth from '@prova-livre/frontend/hooks/useStudentAuth';
import { useNavigate } from '@prova-livre/frontend/router';
import ApiStudent from '@prova-livre/frontend/services/ApiStudent';
import { clamp, number } from '@prova-livre/shared/helpers/number.helper';
import { color, firstLast } from '@prova-livre/shared/helpers/string.helper';
import { type RbkPointerEvent, useTheme, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Divider, Dropdown, Grid, ListItem, Scrollable, Text } from '@react-bulk/web';

export default function StudentHeader() {
  const { user, company: authCompany, logout, setToken } = useStudentAuth();
  const { isMobile, drawer } = useLayout();
  const navigate = useNavigate();
  const toaster = useToaster();
  const theme = useTheme();

  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [companiesEl, setCompaniesEl] = useState<HTMLElement>();

  const [companiesElHeight, setCompaniesElHeight] = useState(0);
  const [companiesScrollHeight, setCompaniesScrollHeight] = useState(0);

  const updateCompaniesScrollHeight = () => {
    if (companiesEl) {
      setCompaniesScrollHeight(number(document.querySelector('main')?.offsetHeight));
    }
  };

  const { data: companies, state: companiesState } = useRequest<SchemaRoute<typeof CompanyListSchema>>('/companies');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangeCompany = async (e: RbkPointerEvent, companyId: number) => {
    try {
      const response = await ApiStudent.post<SchemaResponse<typeof AuthCompanySignSchema>>('/auth/company', {
        companyId,
      });
      setToken(response.data.token);
      window.location.href = '/';
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  useEffect(() => {
    updateCompaniesScrollHeight();
    window.addEventListener('resize', updateCompaniesScrollHeight);
    return () => {
      window.removeEventListener('resize', updateCompaniesScrollHeight);
    };
  });

  useEffect(() => {
    if (!companiesEl) return;

    setCompaniesElHeight(number(companiesEl.offsetHeight + theme.rem(1)));
  }, [companiesEl, theme]);

  return (
    <Box component="header" bg="background" borderBottom="1px solid gray.main.25" p="1gap">
      <Grid center gap noWrap row>
        {isMobile ? (
          <Box>
            <Button circular variant="text" onPress={drawer.open}>
              <Icon name="List" size={20} />
            </Button>
          </Box>
        ) : (
          <Box>
            <LinkChild href="/">
              <Box>
                <Logo />
              </Box>
            </LinkChild>
          </Box>
        )}

        <Box center flex noWrap row>
          <Box>
            <Button
              circular
              endAddon={({ color }) => <Icon color={color} name="CaretDown" weight="bold" />}
              labelStyle={{ fontSize: '1.25rem' }}
              px="1gap"
              transform="none"
              variant="text"
              onPress={() => setVisible(true)}
            >
              {authCompany?.name}
            </Button>
            <Dropdown
              l="50%"
              ml="-0.5gap"
              style={{ transform: 'translateX(-50%)' }}
              visible={visible}
              w={280}
              onClose={() => setVisible(false)}
            >
              <Card overflow="hidden" p={0}>
                <State {...companiesState}>
                  <Scrollable
                    contentInset="0.5gap"
                    h={clamp(companiesScrollHeight, Math.min(companiesElHeight, 200), Math.min(companiesElHeight, 400))}
                  >
                    <Box ref={setCompaniesEl}>
                      {companies?.map((company, index) => {
                        const isActive = company.id === authCompany?.id;

                        return (
                          <ListItem
                            key={company.id}
                            chevron
                            accessibility={{ label: `Trocar acesso para "${company.name}"` }}
                            bg={isActive ? 'primary.main.15' : 'background'}
                            className="list-item"
                            mt={index ? 1 : 0}
                            onPress={(e) => handleChangeCompany(e, company.id)}
                          >
                            <Box my={-2}>
                              <Icon name="Buildings" size={20} weight={isActive ? 'bold' : 'regular'} />
                            </Box>
                            <Box flex>
                              <Text
                                bold={isActive}
                                color={isActive ? 'primary' : 'text.secondary'}
                                numberOfLines={2}
                                variant="secondary"
                              >
                                {company?.name}
                              </Text>
                            </Box>
                          </ListItem>
                        );
                      })}
                    </Box>
                  </Scrollable>
                </State>
              </Card>
            </Dropdown>
          </Box>
        </Box>

        {/*TODO: fix student dark theme*/}
        {/*<Box>*/}
        {/*  <Tooltip position="left" title={mode === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>*/}
        {/*    <Button circular variant="text" onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}>*/}
        {/*      <Icon name={mode === 'dark' ? 'Sun' : 'Moon'} size={20} />*/}
        {/*    </Button>*/}
        {/*  </Tooltip>*/}
        {/*</Box>*/}

        <Box>
          <Button circular variant="text" onPress={() => setIsUserMenuVisible(true)}>
            <Icon name="UserCircle" size={24} />
          </Button>
        </Box>
      </Grid>

      <Dropdown r={0} t={0} visible={isUserMenuVisible} onClose={() => setIsUserMenuVisible(false)}>
        <Card w={320}>
          <Box mr="-0.75gap" mt="-0.75gap">
            <Button circular align="end" variant="text" onPress={() => setIsUserMenuVisible(false)}>
              <Icon name="X" size={20} />
            </Button>
          </Box>

          <Box center>
            <Box center bg="primary" borderRadius={30} h={60} w={60}>
              <Text color={theme.contrast(color(user?.email))} variant="title">
                {user?.name?.[0]}
              </Text>
            </Box>

            <Text center mt="1gap" variant="subtitle">
              {firstLast(user?.name)}
            </Text>
            <Text center mt={1}>
              {user?.email}
            </Text>
          </Box>

          <Divider mb="1gap" mt="2gap" mx="-1gap" />

          <Box>
            <LinkChild href="/profile">
              <ListItem className="list-item" onPress={() => setIsUserMenuVisible(false)}>
                <Box>
                  <Icon name="User" />
                </Box>
                <Box flex>
                  <Text>Meus Dados</Text>
                </Box>
              </ListItem>
            </LinkChild>
            <ListItem className="list-item" onPress={handleLogout}>
              <Box>
                <Icon name="SignOut" />
              </Box>
              <Box flex>
                <Text>Sair</Text>
              </Box>
            </ListItem>
          </Box>
        </Card>
      </Dropdown>
    </Box>
  );
}
