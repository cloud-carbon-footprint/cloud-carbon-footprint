/*
 * © 2021 Thoughtworks, Inc.
 */

const { resolve } = require('path')
module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  setupFiles: ['../../setupTests.ts'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  moduleNameMapper: {
    '^@typespec/ts-http-runtime/internal/([^/]+)$':
      `${resolve(__dirname, 'node_modules')}/@typespec/ts-http-runtime/dist/commonjs/$1/internal.js`,
  },
}
