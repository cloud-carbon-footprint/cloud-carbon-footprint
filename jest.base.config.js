/*
 * © 2021 Thoughtworks, Inc.
 */

const path = require('path')

const typeSpecRuntimeRoot = path.dirname(
  require.resolve('@typespec/ts-http-runtime/package.json'),
)

const typeSpecModuleNameMapper = {
  '^@typespec/ts-http-runtime/internal/logger$': path.join(
    typeSpecRuntimeRoot,
    'dist/commonjs/logger/internal.js',
  ),
  '^@typespec/ts-http-runtime/internal/policies$': path.join(
    typeSpecRuntimeRoot,
    'dist/commonjs/policies/internal.js',
  ),
  '^@typespec/ts-http-runtime/internal/util$': path.join(
    typeSpecRuntimeRoot,
    'dist/commonjs/util/internal.js',
  ),
}

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
    ...(module.exports?.moduleNameMapper || {}),
    ...typeSpecModuleNameMapper,
  },
}
