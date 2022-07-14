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
      branches: 80,
      lines: 90,
      functions: 90,
    },
  },
  modulePathIgnorePatterns: ['index.ts'],
}
