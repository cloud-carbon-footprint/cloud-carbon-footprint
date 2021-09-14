/*
 * © 2021 Thoughtworks, Inc.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.base.config')

module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      statements: 99,
      branches: 90,
      functions: 100,
      lines: 99,
    },
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/src/CliPrompts.ts',
    '<rootDir>/src/__tests__/fixtures',
  ],
  testPathIgnorePatterns: ['<rootDir>/src/__tests__/fixtures'],
  modulePathIgnorePatterns: ['index.ts'],
}
