/*
 * © 2021 Thoughtworks, Inc.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.base.config')

module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      statements: 92,
      branches: 84,
      lines: 93,
      functions: 93,
    },
  },
  modulePathIgnorePatterns: ['index.ts'],
}
