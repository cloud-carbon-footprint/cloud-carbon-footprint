/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

module.exports = {
  roots: ['<rootDir>/test', '<rootDir>/src'],
  setupFiles: ['<rootDir>/test/setEnvVars.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  coverageThreshold: {
    global: {
      branches: 83,
      functions: 100,
      lines: 96,
      statements: 96,
    },
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/src/CliPrompts.ts'],
}
