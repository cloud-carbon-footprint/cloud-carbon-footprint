/*
 * © 2021 Thoughtworks, Inc.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.base.config')

module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 92,
      functions: 91,
      lines: 96,
    },
  },
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/fixtures',
    '<rootDir>/src/__tests__/helpers.ts',
  ],
  modulePathIgnorePatterns: ['index.ts'],
}
