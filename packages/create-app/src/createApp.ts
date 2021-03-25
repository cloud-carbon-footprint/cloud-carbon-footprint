/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
import os from 'os'
import fs from 'fs-extra'
import { promisify } from 'util'
import { exec as execCb } from 'child_process'
import { resolve } from 'path'
import { input, prompt } from 'typed-prompts'

import { templatingTask } from './lib/templating'
import { getTargetDir } from './lib/paths'

const exec = promisify(execCb)

async function checkExists(rootDir: string, name: string) {
  const destination = resolve(rootDir, name)
  if (await fs.pathExists(destination)) {
    const existing = destination.replace(`${rootDir}/`, '')
    throw new Error(
      `A directory with the same name already exists: ${existing}\nPlease try again with a different app name`,
    )
  }
}

async function createTemporaryAppFolder(tempDir: string) {
  try {
    await fs.mkdir(tempDir)
  } catch (error) {
    throw new Error(
      `Failed to create temporary app directory: ${error.message}`,
    )
  }
}

async function moveApp(tempDir: string, destination: string, id: string) {
  try {
    await fs.move(tempDir, destination)
  } catch (error) {
    throw new Error(
      `Failed to move app from ${tempDir} to ${destination}: ${error.message}`,
    )
  }
}

async function buildApp(appDir: string) {
  const runCmd = async (cmd: string) => {
    process.chdir(appDir)

    try {
      await exec(cmd)
    } catch (error) {
      process.stdout.write(error.stderr)
      process.stdout.write(error.stdout)
      throw new Error(`Could not execute command ${cmd}`)
    }
  }

  await runCmd('yarn install')
}

export default async (): Promise<void> => {
  const answers = await prompt([
    input('name', 'Enter a name for the app [required]'),
  ])

  const targetDirectory = getTargetDir()
  const templateDir = resolve(__dirname, '../templates/default-app')
  const tempDir = resolve(os.tmpdir(), answers.name)
  const appDir = resolve(targetDirectory, answers.name)

  try {
    console.log('Checking if the directory is available')
    await checkExists(targetDirectory, answers.name)

    console.log('Creating a temporary app directory')
    await createTemporaryAppFolder(tempDir)

    console.log('Preparing files')
    await templatingTask(templateDir, tempDir, answers)

    console.log('Moving to final location')
    await moveApp(tempDir, appDir, answers.name)

    console.log('Building the app')
    await buildApp(appDir)

    console.log(
      `Successfully created Cloud Carbon Footprint app: ${answers.name}`,
    )
  } catch (error) {
    console.log(`There was an error creating your App: ${error.message}`)
  }
}
