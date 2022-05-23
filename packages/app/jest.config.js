/*
 * © 2021 Thoughtworks, Inc.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.base.config')

module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 65,
      lines: 78,
      functions: 71,
    },
  },
  modulePathIgnorePatterns: ['index.ts'],
}
