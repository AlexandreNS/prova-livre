import { useContext } from 'react';

import { LayoutContext } from '@prova-livre/frontend/contexts/LayoutContext';

export default function useLayout() {
  return useContext(LayoutContext);
}
