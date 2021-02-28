/* eslint-disable */
const tsConfigDev = require('./tsconfig.json')
const tsConfigProd = require('./tsconfig.prod.json')
/* eslint-disable */
const tsConfigPaths = require('tsconfig-paths')

const tsConfig = process.env.NODE_ENV === "production" ? tsConfigProd : tsConfigDev

let { baseUrl, paths } = tsConfig.compilerOptions
for (path in paths) {
  paths[path][0] = paths[path][0].replace('src', 'dist').replace('.ts', '.js')
}

tsConfigPaths.register({ baseUrl, paths })
