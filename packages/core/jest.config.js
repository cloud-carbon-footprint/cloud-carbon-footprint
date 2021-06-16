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
      statements: 98,
      branches: 78,
      functions: 96,
      lines: 98,
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
    '<rootDir>/src/compute/ServiceWithCPUUtilization.ts',
    '<rootDir>/src/.*/index.ts',
  ],
}
