/*
 * © 2021 Thoughtworks, Inc.
 */

import path from 'path'
import fs from 'fs-extra'

const packagePath = process.cwd()
const packageJsonPath = path.resolve(packagePath, './package.json')
const backupPackageJsonPath = path.resolve(
  packagePath,
  './package.json-prepack',
)

async function buildPackageJson() {
  const packageFile = await fs.readFile(packageJsonPath, 'utf8')

  await fs.writeFile(backupPackageJsonPath, packageFile)

  const packageData = JSON.parse(packageFile)
  const { publishConfig } = packageData
  const newPackageData = {
    ...packageData,
    ...publishConfig,
  }
  fs.writeJSON(packageJsonPath, newPackageData, { encoding: 'utf8', spaces: 2 })

  console.log(`Updated package.json in ${packageJsonPath}`)
}

async function run() {
  try {
    await buildPackageJson()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
