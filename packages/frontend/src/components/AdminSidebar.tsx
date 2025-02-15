import { useLocation } from 'react-router-dom';

import Icon, { type IconProps } from '@prova-livre/frontend/components/Icon';
import LinkChild, { type LinkChildProps } from '@prova-livre/frontend/components/LinkChild';
import Logo from '@prova-livre/frontend/components/Logo';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useLayout from '@prova-livre/frontend/hooks/useLayout';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { hasPermission } from '@prova-livre/shared/helpers/feature.helper';
import { Box, Divider, Drawer, ListItem, Scrollable, Text } from '@react-bulk/web';

type MenuGroup = {
  menus: {
    hidden?: boolean;
    icon: IconProps['name'];
    label: string;
    target?: LinkChildProps['target'];
    url: string;
  }[];
  title?: string;
};

export default function AdminSidebar() {
  const { user, token } = useAdminAuth();
  const { pathname } = useLocation();
  const { isMobile, drawer } = useLayout();

  const groups: MenuGroup[] = [
    {
      menus: [
        {
          icon: 'House',
          label: 'Início',
          url: '/admin',
        },
      ],
    },
    {
      title: 'Banco de Questões',
      menus: [
        {
          icon: 'Bookmark',
          label: 'Categorias',
          url: '/admin/categories',
          hidden: !hasPermission(user?.role, 'Category-Read'),
        },
        {
          icon: 'List',
          label: 'Questões',
          url: '/admin/questions',
          hidden: !hasPermission(user?.role, 'Question-Read'),
        },
      ],
    },
    {
      title: 'Gestão de Estudantes',
      menus: [
        {
          icon: 'Student',
          label: 'Estudantes',
          url: '/admin/students',
          hidden: !hasPermission(user?.role, 'Student-Read'),
        },
        {
          icon: 'UsersFour',
          label: 'Turmas',
          url: '/admin/classes',
          hidden: !hasPermission(user?.role, 'Class-Read'),
        },
      ],
    },
    {
      title: 'Aplicação de Prova',
      menus: [
        {
          icon: 'Note',
          label: 'Provas',
          url: '/admin/exams',
          hidden: !hasPermission(user?.role, 'Exam-Read'),
        },
        {
          icon: 'CalendarPlus',
          label: 'Aplicações',
          url: '/admin/applications',
          hidden: !hasPermission(user?.role, 'Application-Read'),
        },
        {
          icon: 'ListNumbers',
          label: 'Correções',
          url: '/admin/corrections',
          hidden: !hasPermission(user?.role, 'Correction-Read'),
        },
      ],
    },
    {
      title: 'Gestão de Usuários',
      menus: [
        {
          icon: 'Buildings',
          label: 'Instituições',
          url: '/admin/companies',
          hidden: !user?.permissions.createCompany,
        },
        {
          icon: 'Users',
          label: 'Usuários',
          url: '/admin/users',
          hidden: !hasPermission(user?.role, 'User-Read'),
        },
      ],
    },
    {
      title: 'Sistema',
      menus: [
        {
          icon: 'Gear',
          label: 'Configurações',
          url: '/admin/su/system-settings',
          hidden: !hasPermission(user?.role, 'SystemSettings'),
        },
        {
          icon: 'Notepad',
          label: 'Logs',
          url: '/admin/su/logger',
          hidden: user?.role !== 'su',
        },
      ],
    },
    {
      menus: [
        {
          icon: 'Books',
          label: 'API Docs',
          url: `${ApiAdmin.baseURL}/auth/cookie?token=${token}&redirect=/docs`,
          target: '_blank',
          hidden: !hasPermission(user?.role, 'Api-Docs'),
        },
      ],
    },
  ];

  const mobileProps = !isMobile
    ? {}
    : {
        component: Drawer,
        placement: 'left',
        visible: drawer.isVisible,
        onClose: drawer.close,
      };

  return (
    <Box {...mobileProps} flex>
      <Box component="aside" flex bg="background" borderRight="1px solid gray.main.25" w={240}>
        <Scrollable component="nav" contentInset="1gap">
          {isMobile && (
            <LinkChild href="/admin">
              <Box mb="1gap">
                <Logo />
              </Box>
            </LinkChild>
          )}

          {groups.map((group, groupIndex) => {
            const menus = group.menus.filter(({ hidden }) => !hidden);

            if (!menus.length) {
              return null;
            }

            return (
              <Box key={groupIndex}>
                {group.title ? (
                  <Text color="text.secondary" mb="1gap" transform="uppercase" variant="caption" weight="800">
                    {group.title}
                  </Text>
                ) : null}

                {menus.map((menu, index) => {
                  const isActive = menu.url === pathname || (menu.url !== '/admin' && pathname.startsWith(menu.url));

                  return (
                    <Box key={index} my={1}>
                      <LinkChild href={menu.url} target={menu.target}>
                        <ListItem
                          className="list-item"
                          corners={1.5}
                          px={3}
                          py={2}
                          style={[isActive && { bg: 'primary.main.15' }]}
                          onPress={drawer.close}
                        >
                          <Box>
                            <Icon name={menu.icon} size={20} />
                          </Box>
                          <Box flex>
                            <Text
                              color={isActive ? 'primary' : 'text'}
                              letterSpacing={0.5}
                              variant="secondary"
                              weight="500"
                            >
                              {menu.label}
                            </Text>
                          </Box>
                          {menu.target === '_blank' && (
                            <Box>
                              <Icon name="ArrowSquareOut" size={18} />
                            </Box>
                          )}
                        </ListItem>
                      </LinkChild>
                    </Box>
                  );
                })}

                <Divider my="1gap" />
              </Box>
            );
          })}

          <Text center variant="caption">
            Prova Livre v1.0.0
          </Text>
        </Scrollable>
      </Box>
    </Box>
  );
}
