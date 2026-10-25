import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the build works under any path (e.g. a preview's)
  base: './',
  server: {
    port: 3000,
  },
  build: {
    rolldownOptions: {
      // Dependencies' license comments (e.g. Font Awesome's, whose icons ask for credit) stay in the build
      output: { comments: { legal: true } },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
});
