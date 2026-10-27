import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/** Font files the build preloads: the latin ones, which every page uses (`src/styles/fonts.css`) */
const PRELOADED_FONT = /-latin-\d+-normal-[\w-]+\.woff2$/;

export default defineConfig({
  plugins: [react(), preloadFonts()],
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

/**
 * Preload the site's fonts in the built page's head, so they download alongside
 * its script rather than once its styles are parsed: text waits for them
 * (`font-display: block`), so they must arrive early. Development serves them
 * as they're requested.
 */
function preloadFonts() {
  return {
    name: 'preload-fonts',
    transformIndexHtml: {
      order: 'post',
      handler(_html, { bundle }) {
        if (!bundle) return [];

        return Object.keys(bundle)
          .filter((fileName) => PRELOADED_FONT.test(fileName))
          .map((fileName) => ({
            tag: 'link',
            attrs: { rel: 'preload', href: `./${fileName}`, as: 'font', type: 'font/woff2', crossorigin: '' },
            injectTo: 'head',
          }));
      },
    },
  };
}
