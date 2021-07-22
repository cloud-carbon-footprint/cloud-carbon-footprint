/*
 * © 2021 Thoughtworks, Inc.
 */

const { exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')

async function main() {
  const currentPackageName = process.argv.slice(2)[0]
  const packageNames = process.argv.slice(2).slice(1)

  updatePackageDepencies(packageNames, currentPackageName)
  copyDistDirectories(packageNames, currentPackageName)
}

main().catch((error) => {
  console.error(error.stack)
  process.exit(1)
})

async function runCmd(cmd) {
  const promisifyExec = promisify(exec)
  try {
    await promisifyExec(cmd)
  } catch (error) {
    process.stdout.write(error.stderr)
    process.stdout.write(error.stdout)
    throw new Error(`Could not execute command ${cmd}`)
  }
}

function copyDistDirectories(packageNames, currentPackageName) {
  const baseDir = path.resolve(
    __dirname,
    `../dist-workspace/packages/${currentPackageName}`,
  )

  packageNames.forEach((name) => {
    const targetDir = path.resolve(
      __dirname,
      `../dist-workspace/packages/${name}`,
    )
    runCmd(`cp -a ${targetDir} ${baseDir}`)

    if (['client'].includes(currentPackageName) === false) {
      runCmd(`cp -a ${targetDir} ${baseDir}/dist`)
    }
  })
}

function updatePackageDepencies(packageNames, currentPackageName) {
  try {
    const data = fs.readFileSync(
      path.resolve(
        __dirname,
        `../dist-workspace/packages/${currentPackageName}/package.json`,
      ),
      'utf8',
    )
    const packageJSON = JSON.parse(data)
    packageNames.forEach((name) => {
      const localDeps = Object.keys(packageJSON.dependencies)
        .filter((key) => key === `@cloud-carbon-footprint/${name}`)
        .pop()
      packageJSON.dependencies[localDeps] = `file:./${name}`
    })

    fs.writeFile(
      path.resolve(
        __dirname,
        `../dist-workspace/packages/${currentPackageName}/package.json`,
      ),
      JSON.stringify(packageJSON),
      (err) => {
        if (err) {
          console.error(err)
          return
        }
      },
    )
  } catch (err) {
    console.error(err)
  }
}
