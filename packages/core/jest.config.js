/*
 * © 2021 ThoughtWorks, Inc.
 */

module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  coverageThreshold: {
    global: {
      statements: 99,
      branches: 89,
      functions: 100,
      lines: 99,
    },
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/src/services/aws/__tests__/fixtures',
    '<rootDir>/src/services/gcp/__tests__/fixtures',
    '<rootDir>/src/__tests__/__mocks__',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/index.ts',
    '<rootDir>/src/BillingDataRow.ts',
    '<rootDir>/src/compute/ServiceWithCPUUtilization.ts',
    '<rootDir>/src/.*/index.ts',
  ],
}
