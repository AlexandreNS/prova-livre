import { useContext } from 'react';

import { StudentAuthContext } from '@prova-livre/frontend/contexts/StudentAuthContext';

export default function useAdminAuth() {
  return useContext(StudentAuthContext);
}
