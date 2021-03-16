/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import path from 'path'
import fs from 'fs-extra'

const packagePath = process.cwd()
const packageJsonPath = path.resolve(packagePath, './package.json')
const backupPackageJsonPath = path.resolve(
  packagePath,
  './package.json-prepack',
)

async function restorePackageJson() {
  await fs.move(backupPackageJsonPath, packageJsonPath, {
    overwrite: true,
  })
}

async function run() {
  try {
    await restorePackageJson()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
