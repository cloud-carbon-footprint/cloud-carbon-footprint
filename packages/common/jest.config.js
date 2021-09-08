/*
 * © 2021 Thoughtworks, Inc.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.base.config')

module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      statements: 94,
      branches: 85,
      functions: 94,
      lines: 97,
    },
  },
  modulePathIgnorePatterns: ['index.ts'],
}
