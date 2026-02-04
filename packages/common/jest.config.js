/*
 * © 2021 Thoughtworks, Inc.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.base.config')

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^node-fetch$': '<rootDir>/src/__mocks__/node-fetch.js',
    '^winston$': '<rootDir>/src/__mocks__/winston.js',
  },
  coverageThreshold: {
    global: {
      statements: 94,
      branches: 80,
      functions: 74,
      lines: 96,
    },
  },
  modulePathIgnorePatterns: ['index.ts'],
}
