/*
 * © 2023 Thoughtworks, Inc.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.base.config')

module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      statements: 0.8,
      branches: 0.8, //todo: increase coverage, it was 88 before
      functions: 0.8,
      lines: 0.8,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/src/__tests__/fixtures'],
  modulePathIgnorePatterns: ['index.ts'],
}
