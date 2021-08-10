/*
 * © 2021 Thoughtworks, Inc.
 */

/*
This is a list of all packages used by the template. If dependencies are added or removed,
this list should be updated as well.

The list is here to ensure correct versioning and bumping of this package.
Without this list the version would not be bumped unless we manually trigger a release.

This does not create an actual dependency on these packages and does not bring in any code.
*/

import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import chalk from 'chalk'

const exec = promisify(execCb)

export const grabPackageVersion = async (
  packageName: string,
): Promise<string> => {
  return await runCmd(`npm show @cloud-carbon-footprint/${packageName} version`)
}

export const packageVersions = async () => {
  return {
    '@cloud-carbon-footprint/app': await grabPackageVersion('app'),
    '@cloud-carbon-footprint/common': await grabPackageVersion('common'),
  }
}

export const runCmd = async (cmd: string) => {
  try {
    const version = await exec(cmd)
    return version.stdout.substr(0, version.stdout.indexOf('\n'))
  } catch (error) {
    process.stdout.write(error.stderr)
    process.stdout.write(error.stdout)
    throw new Error(`Could not execute command ${chalk.cyan(cmd)}`)
  }
}
