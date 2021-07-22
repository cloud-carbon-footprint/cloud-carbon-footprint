/*
 * © 2021 Thoughtworks, Inc.
 */

import chalk from 'chalk'
import fs from 'fs-extra'
import handlebars from 'handlebars'
import ora from 'ora'
import { basename, dirname } from 'path'
import recursive from 'recursive-readdir'
import { packageVersions } from './versions'

const TASK_NAME_MAX_LENGTH = 14

export class Task {
  static log(name = ''): void {
    process.stdout.write(`${chalk.green(name)}\n`)
  }

  static error(message = ''): void {
    process.stdout.write(`\n${chalk.red(message)}\n\n`)
  }

  static section(name: string): void {
    const title = chalk.green(`${name}:`)
    process.stdout.write(`\n ${title}\n`)
  }

  static exit(code = 0): void {
    process.exit(code)
  }

  static async forItem(
    task: string,
    item: string,
    taskFunc: () => Promise<void>,
  ): Promise<void> {
    const paddedTask = chalk.green(task.padEnd(TASK_NAME_MAX_LENGTH))

    const spinner = ora({
      prefixText: chalk.green(`  ${paddedTask}${chalk.cyan(item)}`),
      spinner: 'arc',
      color: 'green',
    }).start()

    try {
      await taskFunc()
      spinner.succeed()
    } catch (error) {
      spinner.fail()
      throw error
    }
  }
}

export async function templatingTask(
  templateDir: string,
  destinationDir: string,
  context: any,
): Promise<void> {
  const files = await recursive(templateDir).catch((error) => {
    throw new Error(`Failed to read template directory: ${error.message}`)
  })

  for (const file of files) {
    const destinationFile = file.replace(templateDir, destinationDir)
    await fs.ensureDir(dirname(destinationFile))

    if (file.endsWith('.hbs')) {
      await Task.forItem('templating', basename(file), async () => {
        const destination = destinationFile.replace(/\.hbs$/, '')

        const versions = await packageVersions()
        const template = await fs.readFile(file)
        const compiled = handlebars.compile(template.toString())
        const contents = compiled(
          { name: basename(destination), ...context },
          {
            helpers: {
              version(name: keyof typeof versions) {
                if (name in versions) {
                  return versions[name]
                }
                throw new Error(`No version available for package ${name}`)
              },
            },
          },
        )

        await fs.writeFile(destination, contents).catch((error) => {
          throw new Error(
            `Failed to create file: ${destination}: ${error.message}`,
          )
        })
      })
    } else {
      await Task.forItem('copying', basename(file), async () => {
        await fs.copyFile(file, destinationFile).catch((error) => {
          const destination = destinationFile
          throw new Error(
            `Failed to copy file to ${destination} : ${error.message}`,
          )
        })
      })
    }
  }
}
