/*
 * © 2021 Thoughtworks, Inc.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.base.config')

module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      statements: 93,
      branches: 84,
      lines: 94,
      functions: 94,
    },
  },
  modulePathIgnorePatterns: ['index.ts'],
}
