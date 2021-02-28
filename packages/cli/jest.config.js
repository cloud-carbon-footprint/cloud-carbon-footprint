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
      branches: 83,
      functions: 100,
      lines: 98.5,
      statements: 98,
    },
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  moduleNameMapper: {
    '^@application/(.*)$': '<rootDir>/../core/src/application/$1',
    '^@domain/(.*)$': '<rootDir>/../core/src/domain/$1',
    '^@services/(.*)$': '<rootDir>/../core/src/services/$1',
    '^@view/(.*)$': '<rootDir>/src/view/$1',
    '^@fixtures$': '<rootDir>/test/fixtures/cloudwatch.fixtures.ts',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/src/view/CliPrompts.ts'],
}
