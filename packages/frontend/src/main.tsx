import { Routes } from '@generouted/react-router';
import useLocalStorage from '@prova-livre/frontend/hooks/useLocalStorage';
import dark from '@prova-livre/frontend/themes/dark';
import light from '@prova-livre/frontend/themes/light';
import { Box, ReactBulk } from '@react-bulk/web';
import { ArcElement, Chart as ChartJS, Legend, Tooltip as TooltipChartJs } from 'chart.js';
import { createRoot } from 'react-dom/client';

import '@prova-livre/frontend/styles/global.css';

ChartJS.register(ArcElement, TooltipChartJs, Legend);

function App() {
  const [mode] = useLocalStorage<'dark' | 'light'>('theme', 'light');

  return (
    <ReactBulk theme={mode === 'dark' ? dark : light}>
      <Box h="100%" w="100%">
        <Routes />
      </Box>
    </ReactBulk>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
