/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import js from '@eslint/js';
import headers from 'eslint-plugin-headers';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import { resolve } from 'path';
import tseslint from 'typescript-eslint';

const tsParserOptions = {
  project: ['./tsconfig.base.json'],
  tsconfigRootDir: process.cwd(),
};

// Attach parserOptions and restrict to TS files for type-aware presets
// Exclude frontend files as they use different tsconfig structure
const withTsProject = (cfgArray) =>
  cfgArray.map((cfg) => ({
    ...cfg,
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['apps/frontend/**'],
    languageOptions: {
      ...(cfg.languageOptions ?? {}),
      parserOptions: {
        ...((cfg.languageOptions && cfg.languageOptions.parserOptions) ?? {}),
        ...tsParserOptions,
      },
    },
  }));

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      'coverage/**',
      '**/*.d.ts',
      'pnpm-lock.yaml',
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // Make ESLint treat config/scripts as Node (so `process`, `console`, etc. are defined)
  {
    name: 'matrix-academy:node-globals (configs & tools)',
    files: ['eslint.config.js', 'tools/**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },

  // TypeScript recommended (type-aware) + stylistic (type-aware) — TS files only (excluding frontend)
  ...withTsProject(tseslint.configs.recommendedTypeChecked),
  ...withTsProject(tseslint.configs.stylisticTypeChecked),

  // Frontend TypeScript configuration (uses different tsconfig structure)
  ...tseslint.configs.recommendedTypeChecked.map((cfg) => ({
    ...cfg,
    files: ['apps/frontend/**/*.ts', 'apps/frontend/**/*.tsx'],
    languageOptions: {
      ...(cfg.languageOptions ?? {}),
      parserOptions: {
        ...((cfg.languageOptions && cfg.languageOptions.parserOptions) ?? {}),
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: resolve(process.cwd(), 'apps/frontend'),
      },
    },
  })),
  ...tseslint.configs.stylisticTypeChecked.map((cfg) => ({
    ...cfg,
    files: ['apps/frontend/**/*.ts', 'apps/frontend/**/*.tsx'],
    languageOptions: {
      ...(cfg.languageOptions ?? {}),
      parserOptions: {
        ...((cfg.languageOptions && cfg.languageOptions.parserOptions) ?? {}),
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: resolve(process.cwd(), 'apps/frontend'),
      },
    },
  })),

  // Root repo rules (apply to JS & TS)
  {
    name: 'matrix-academy:root',
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.turbo/**', '**/coverage/**'],
    plugins: {
      headers, // eslint-plugin-headers
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    settings: {
      // let eslint-plugin-import resolve TS paths/aliases
      'import/resolver': {
        typescript: { project: ['./tsconfig.base.json'] },
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node, ...globals.es2023 },
    },
    rules: {
      // JSDoc SPDX header
      'headers/header-format': [
        'error',
        {
          source: 'string',
          style: 'jsdoc',
          content: `@file

SPDX-License-Identifier: GPL-3.0-or-later`,
          trailingNewlines: 1,
          preservePragmas: true,
        },
      ],

      // Import hygiene
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'error',

      // Cycle & self-import guards
      'import/no-cycle': ['error', { maxDepth: 1, ignoreExternal: true }],
      'import/no-self-import': 'error',

      // Unused imports/vars (auto-removable)
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },

  // TS-only project rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Enforce NodeNext ESM style in TS source:
      // - relative imports must use .js (so compiled JS runs natively)
      // - .ts/.tsx must NOT appear in import specifiers
      'import/extensions': [
        'error',
        'always',
        {
          ignorePackages: true,
          pattern: {
            js: 'always',
            mjs: 'always',
            cjs: 'always',
            jsx: 'always',
            ts: 'never',
            tsx: 'never',
            mts: 'never',
            cts: 'never',
          },
        },
      ],

      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports
    },
  },

  // Entrypoints: Nest's Type<any> token trips this rule; disable just here
  {
    files: ['apps/**/src/main.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },

  // Controllers & Guards: Need regular imports for DI (services, guards) and validation (DTOs)
  {
    files: ['**/*.controller.ts', '**/*.guard.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },

  // Tests & tooling: allow dev deps and loosen some checks
  {
    files: [
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/test/**/*.ts',
      'tools/**',
      '**/jest*.{cjs,js,ts}',
      '**/vitest.config.{ts,js}',
      '**/*.config.{ts,js,cjs,mjs}',
      '**/test-utils/**',
    ],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  // Frontend React rules
  {
    name: 'matrix-academy:frontend-react',
    files: ['apps/frontend/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Frontend-specific: Disable extension enforcement for Vite bundler resolution
  {
    name: 'matrix-academy:frontend-imports',
    files: ['apps/frontend/**/*.{ts,tsx}'],
    rules: {
      // Vite with bundler resolution handles extensions differently
      // Allow both with and without extensions for flexibility
      'import/extensions': 'off',
    },
  },
];
