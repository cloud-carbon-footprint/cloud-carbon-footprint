/*
 * © 2021 Thoughtworks, Inc.
 */

import fs from 'fs-extra'
import { promisify } from 'util'
import chalk from 'chalk'
import inquirer, { Answers, Question } from 'inquirer'
import { exec as execCb } from 'child_process'
import { resolve as resolvePath } from 'path'
import os from 'os'

import { Task, templatingTask } from './lib/tasks'
import { getTargetDir } from './lib/paths'
import { Command } from 'commander'

interface CommandWithArgs extends Command {
  skipInstall: string
}

const exec = promisify(execCb)

async function checkExists(rootDir: string, name: string) {
  await Task.forItem('checking', name, async () => {
    const destination = resolvePath(rootDir, name)

    if (await fs.pathExists(destination)) {
      const existing = chalk.cyan(destination.replace(`${rootDir}/`, ''))
      throw new Error(
        `A directory with the same name already exists: ${existing}\nPlease try again with a different app name`,
      )
    }
  })
}

async function createTemporaryAppFolder(tempDir: string) {
  await Task.forItem('creating', 'temporary directory', async () => {
    try {
      await fs.mkdir(tempDir)
    } catch (error) {
      throw new Error(
        `Failed to create temporary app directory: ${error.message}`,
      )
    }
  })
}

async function cleanUp(tempDir: string) {
  await Task.forItem('remove', 'temporary directory', async () => {
    await fs.remove(tempDir)
  })
}

async function buildApp(appDir: string) {
  const runCmd = async (cmd: string) => {
    await Task.forItem('executing', cmd, async () => {
      process.chdir(appDir)
      try {
        // Increase the default stdout buffer size from 500 MB (default) to 2000 MB in order to allow for the yarn install to succeed
        await exec(cmd, { maxBuffer: 1024 * 2000 })
      } catch (error) {
        process.stdout.write(error.stderr)
        process.stdout.write(error.stdout)
        throw new Error(`Could not execute command ${chalk.cyan(cmd)}`)
      }
    })
  }
  await runCmd('yarn install')
}

async function moveApp(tempDir: string, destination: string, id: string) {
  await Task.forItem('moving', id, async () => {
    try {
      await fs.move(tempDir, destination)
    } catch (error) {
      throw new Error(
        `Failed to move app from ${tempDir} to ${destination}: ${error.message}`,
      )
    }
  })
}

export default async (cmd: CommandWithArgs): Promise<void> => {
  const questions: Question[] = [
    {
      type: 'input',
      name: 'name',
      message: chalk.blue('Enter a name for the app [required]'),
      validate: (value: string) => {
        if (!value) {
          return chalk.red('Please enter a name for the app')
        } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
          return chalk.red(
            'App name must be kebab-cased and contain only letters, digits, and dashes.',
          )
        }
        return true
      },
    },
  ]

  const answers: Answers = await inquirer.prompt(questions)

  const targetDirectory = getTargetDir()
  const templateDir = resolvePath(__dirname, '../templates/default-app')
  const tempDir = resolvePath(os.tmpdir(), answers.name)
  const appDir = resolvePath(targetDirectory, answers.name)

  Task.log('Creating the app...')

  try {
    Task.section('Checking if the directory is available')
    await checkExists(targetDirectory, answers.name)

    Task.section('Creating a temporary app directory')
    await createTemporaryAppFolder(tempDir)

    Task.section('Preparing files')
    await templatingTask(templateDir, tempDir, answers)

    Task.section('Moving to final location')
    await moveApp(tempDir, appDir, answers.name)

    if (!cmd.skipInstall) {
      Task.section('Building the app')
      await buildApp(appDir)
    }

    Task.log()
    Task.log(
      chalk.green(
        `🥇  Successfully created Cloud Carbon Footprint app: ${chalk.cyan(
          answers.name,
        )}`,
      ),
    )
    Task.log()
    Task.exit()
  } catch (error) {
    Task.log(`There was an error creating your App: ${error.message}`)
    Task.log('We are going to clean up, and then you can try again.')

    Task.section('Cleanup')
    await cleanUp(tempDir)
    Task.error('Failed to create app!')
    Task.exit(1)
  }
}
