import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  { ignores: ['dist'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      // Props are typed with TypeScript
      'react/prop-types': 'off',
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/setupTests.ts', 'src/testUtils.ts'],
    plugins: { 'testing-library': testingLibrary },
    languageOptions: {
      globals: { ...globals.vitest },
    },
    rules: {
      ...testingLibrary.configs['flat/react'].rules,
    },
  },
  {
    files: ['*.config.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: { ...globals.node } },
  },
]);
