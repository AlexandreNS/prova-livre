import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  loader: {
    '.html': 'file',
  },
});
