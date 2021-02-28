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
      branches: 87,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  moduleNameMapper: {
    '^@application/(.*)$': '<rootDir>/../core/src/application/$1',
    '^@domain/(.*)$': '<rootDir>/../core/src/domain/$1',
    '^@services/(.*)$': '<rootDir>/../core/src/services/$1',
    '^@view/(.*)$': '<rootDir>/src/view/$1',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
}
