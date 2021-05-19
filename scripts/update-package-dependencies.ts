/*
 * © 2021 ThoughtWorks, Inc.
 */
import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const exec = promisify(execCb)

async function main() {
  const args = process.argv.slice(2)
  const currentPackageName = args[0]
  const packageNames = args.slice(1)

  updatePackageDepencies(packageNames, currentPackageName)
  // Make sure the package.json file is writen to, toi update the references

  //copy core/dist to api and rename it to core
  copyDistDirectories(packageNames, currentPackageName)
}

const runCmd = async (cmd: string) => {
  try {
    await exec(cmd)
  } catch (error) {
    process.stdout.write(error.stderr)
    process.stdout.write(error.stdout)
    throw new Error(`Could not execute command ${cmd}`)
  }
}

main().catch((error) => {
  console.error(error.stack)
  process.exit(1)
})

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
      `../dist-workspace/packages/${name}/dist`,
    )

    runCmd(`cp -R ${targetDir} ${baseDir}/${name}`)
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
