import { createContext, useMemo, useState } from 'react';

import useLocalStorage from '@prova-livre/frontend/hooks/useLocalStorage';
import { type ReactElement, useBreakpoints } from '@react-bulk/core';

const LayoutContext = createContext<{
  drawer: {
    close: () => void;
    isVisible: boolean;
    open: () => void;
  };
  isMobile: boolean;
  mode: 'dark' | 'light';
  setMode: (mode: 'dark' | 'light') => void;
}>(null as any);

function LayoutProvider({ children }: { children: ReactElement }) {
  const isMobile = !useBreakpoints().md;

  const [mode, setMode] = useLocalStorage<'dark' | 'light'>('theme', 'light');

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      isMobile,
      drawer: {
        isVisible: isDrawerVisible,
        open: () => setIsDrawerVisible(true),
        close: () => setIsDrawerVisible(false),
      },
    }),
    [isDrawerVisible, isMobile, mode, setMode],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export { LayoutContext, LayoutProvider };
