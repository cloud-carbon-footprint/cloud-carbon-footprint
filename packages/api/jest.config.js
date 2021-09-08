/*
 * © 2021 Thoughtworks, Inc.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.base.config')

module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 91,
      functions: 100,
      lines: 89,
    },
  },
  modulePathIgnorePatterns: [
    '<rootDir>/src/server.ts',
    '<rootDir>/src/auth.ts',
    'index.ts',
  ],
}
