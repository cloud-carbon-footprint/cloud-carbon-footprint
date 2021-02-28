/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import path from 'path'
import fs from 'fs'

const packagePath = process.cwd()
const packageJsonPath = path.resolve(packagePath, './package.json')
const buildPackageJsonPath = path.resolve(packagePath, './dist/package.json')

function buildPackageJson() {
  const packageFile = fs.readFileSync(packageJsonPath)
  const packageData = JSON.parse(packageFile.toString()) as { main: string }
  const newPackageData = {
    ...packageData,
    main: 'index.js',
  }
  const newPackageFile = JSON.stringify(newPackageData, null, 2)
  fs.writeFileSync(buildPackageJsonPath, newPackageFile)
  console.log(`Updated package.json in ${packageJsonPath}`)
}

function run() {
  try {
    buildPackageJson()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
