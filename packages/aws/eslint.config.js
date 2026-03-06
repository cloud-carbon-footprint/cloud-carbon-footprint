/*
 * © 2021 Thoughtworks, Inc.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const unusedImports = require('eslint-plugin-unused-imports')

module.exports = [
  {
    ignores: ['dist/'],
  },
  ...tsPlugin.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2023, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
      // parser is automatically set to @typescript-eslint/parser by flat/recommended
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  prettierRecommended,
]
