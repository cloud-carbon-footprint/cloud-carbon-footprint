/*
 * © 2021 Thoughtworks, Inc.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.base.config')

module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      statements: 97,
      branches: 93,
      functions: 95,
      lines: 97,
    },
  },
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/fixtures',
    '<rootDir>/src/__tests__/helpers.ts',
  ],
  modulePathIgnorePatterns: ['index.ts'],
}
