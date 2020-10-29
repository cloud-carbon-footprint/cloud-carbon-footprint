/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

module.exports = {
  roots: ['<rootDir>/test'],
  setupFiles: ['<rootDir>/test/setEnvVars.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  moduleNameMapper: {
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@view/(.*)$': '<rootDir>/src/view/$1',
    '^@fixtures$': '<rootDir>/test/fixtures/cloudwatch.fixtures.ts',
    '^@builders$': '<rootDir>/test/fixtures/builders.ts',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/src/view/CliPrompts.ts'],
}
