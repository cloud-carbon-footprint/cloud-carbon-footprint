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
      branches: 88,
      functions: 100,
      lines: 99,
    },
  },
  testPathIgnorePatterns: [
    '<rootDir>/src/services/aws/__tests__/fixtures',
    '<rootDir>/src/services/gcp/__tests__/fixtures',
    '<rootDir>/src/__tests__/__mocks__',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/index.ts',
    '<rootDir>/src/BillingDataRow.ts',
    '<rootDir>/src/FootprintEstimatesDataBuilder.ts',
    '<rootDir>/src/compute/ServiceWithCPUUtilization.ts',
    '<rootDir>/src/.*/index.ts',
  ],
}
