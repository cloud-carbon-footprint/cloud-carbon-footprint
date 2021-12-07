/*
 * © 2021 Thoughtworks, Inc.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.base.config')

module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      statements: 96,
      branches: 91,
      functions: 100,
      lines: 96,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/src/__tests__/fixtures'],
  modulePathIgnorePatterns: ['index.ts'],
}
