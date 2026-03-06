/*
 * © 2021 Thoughtworks, Inc.
 */

const testcafe = require('eslint-plugin-testcafe')
const prettierRecommended = require('eslint-plugin-prettier/recommended')

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
      // uses ESLint's built-in espree parser - no @babel/eslint-parser needed for plain JS
    },
    plugins: {
      testcafe,
    },
    rules: {
      ...testcafe.configs.recommended.rules,
      '@typescript-eslint/no-unused-expressions': 'off',
      'jest/no-done-callback': 'off',
    },
  },
  prettierRecommended,
]
