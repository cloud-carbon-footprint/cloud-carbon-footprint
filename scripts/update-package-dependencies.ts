/*
 * © 2021 ThoughtWorks, Inc.
 */
import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

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

async function runCmd(cmd: string) {
  const exec = promisify(execCb)
  try {
    await exec(cmd)
  } catch (error) {
    process.stdout.write(error.stderr)
    process.stdout.write(error.stdout)
    throw new Error(`Could not execute command ${cmd}`)
  }
}

function copyDistDirectories(
  packageNames: string[],
  currentPackageName: string,
) {
  const baseDir: string = path.resolve(
    __dirname,
    `../dist-workspace/packages/${currentPackageName}`,
  )
  packageNames.forEach((name) => {
    const targetDir = path.resolve(
      __dirname,
      `../dist-workspace/packages/${name}`,
    )
    runCmd(`cp -R ${targetDir}/dist ${baseDir}/${name}`)
    runCmd(`cp -R ${targetDir}/package.json ${baseDir}/${name}`)
  })
}

function updatePackageDepencies(
  packageNames: string[],
  currentPackageName: string,
) {
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
      packageJSON.dependencies[localDeps] = `./${name}`
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
