import { Outlet } from 'react-router-dom';

import PageHeader from '@prova-livre/frontend/components/PageHeader';

export default function Layout() {
  return (
    <>
      <PageHeader
        title="Meus Dados"
        tabs={[
          { value: '', label: 'Perfil' },
          { value: 'password', label: 'Senha' },
        ]}
      />

      <Outlet />
    </>
  );
}
