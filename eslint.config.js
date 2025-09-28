/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import js from '@eslint/js';
import headers from 'eslint-plugin-headers';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const tsParserOptions = {
  project: ['./tsconfig.base.json'],
  tsconfigRootDir: process.cwd(),
};

// Attach parserOptions and restrict to TS files for type-aware presets
const withTsProject = (cfgArray) =>
  cfgArray.map((cfg) => ({
    ...cfg,
    files: ['**/*.ts', '**/*.tsx'],
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

  // TypeScript recommended (type-aware) + stylistic (type-aware) — TS files only
  ...withTsProject(tseslint.configs.recommendedTypeChecked),
  ...withTsProject(tseslint.configs.stylisticTypeChecked),

  // Root repo rules (apply to JS & TS)
  {
    name: 'matrix-academy:root',
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.turbo/**', '**/coverage/**'],
    plugins: {
      headers, // eslint-plugin-headers
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      // let eslint-plugin-import resolve TS paths/aliases
      'import/resolver': {
        typescript: { project: ['./tsconfig.base.json'] },
      },
    },
    rules: {
      // Enforce a leading JSDoc header with @file and SPDX line.
      // On --fix, it normalizes to a proper /** ... */ block.
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
    },
  },

  // TS-only project rules (register the plugin here)
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
