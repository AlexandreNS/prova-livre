import { useContext } from 'react';

import { AdminAuthContext } from '@prova-livre/frontend/contexts/AdminAuthContext';

export default function useAdminAuth() {
  return useContext(AdminAuthContext);
}
