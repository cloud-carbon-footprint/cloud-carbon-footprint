/* eslint-disable */
const tsConfig = require('./tsconfig.json')
/* eslint-disable */
const tsConfigPaths = require('tsconfig-paths')

let { baseUrl, paths } = tsConfig.compilerOptions
for (path in paths) {
  paths[path][0] = paths[path][0].replace('src', 'dist').replace('.ts', '.js')
}

tsConfigPaths.register({ baseUrl, paths })
