/*
 * © 2021 Thoughtworks, Inc.
 */

import fs from 'fs'
import path from 'path'

import { grabPackageVersion } from '../src/lib/versions'

async function main() {
  try {
    const data = fs.readFileSync(
      path.resolve(__dirname, `../package.json`),
      'utf8',
    )
    const packageJSON = JSON.parse(data)
    const createAppTestVersion = await grabPackageVersion('create-app-dev')
    packageJSON.name = packageJSON.name.concat('-dev')
    packageJSON.version = updateVersion(createAppTestVersion)

    fs.writeFile(
      path.resolve(__dirname, `../package.json`),
      JSON.stringify(packageJSON),
      (err) => {
        if (err) {
          console.error(err)
        }
      },
    )
  } catch (err) {
    throw new Error(
      `There was a problem updating the create-app package. Reason: ${err.message}`,
    )
  }
}

main().catch((error) => {
  console.error(error.stack)
  process.exit(1)
})

function updateVersion(version: string) {
  const patchNumber = version.split('.')[2]
  const newPatchNumber = parseInt(patchNumber) + 1
  return `0.0.${newPatchNumber}`
}
