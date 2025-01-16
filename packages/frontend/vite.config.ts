import generouted from '@generouted/react-router/plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const { PORT, HOST } = process.env;

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react(), generouted()],
  server: {
    host: HOST || 'localhost',
    port: PORT ? Number(PORT) : 3000,
  },
  resolve: {
    alias: [
      {
        find: '@prova-livre/backend',
        replacement: path.resolve(__dirname, '..', 'backend', 'src'),
      },
      {
        find: '@prova-livre/frontend',
        replacement: path.resolve(__dirname, '..', 'frontend', 'src'),
      },
      {
        find: '@prova-livre/shared',
        replacement: path.resolve(__dirname, '..', 'shared', 'src'),
      },
    ],
  },
});
