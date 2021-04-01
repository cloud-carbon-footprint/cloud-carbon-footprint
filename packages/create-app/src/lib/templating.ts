/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import fs from 'fs-extra'
import handlebars from 'handlebars'
import { basename, dirname } from 'path'
import recursive from 'recursive-readdir'

import { packageVersions } from './versions'

export async function templatingTask(
  templateDir: string,
  destinationDir: string,
  context: any,
) {
  const files = await recursive(templateDir).catch((error) => {
    throw new Error(`Failed to read template directory: ${error.message}`)
  })

  for (const file of files) {
    const destinationFile = file.replace(templateDir, destinationDir)
    await fs.ensureDir(dirname(destinationFile))

    if (file.endsWith('.hbs')) {
      const destination = destinationFile.replace(/\.hbs$/, '')

      const template = await fs.readFile(file)
      const compiled = handlebars.compile(template.toString())
      const contents = compiled(
        { name: basename(destination), ...context },
        {
          helpers: {
            version(name: keyof typeof packageVersions) {
              if (name in packageVersions) {
                return packageVersions[name]
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
    } else {
      try {
        await fs.copyFile(file, destinationFile)
      } catch (error) {
        throw new Error(
          `Failed to copy file to ${destinationFile} : ${error.message}`,
        )
      }
    }
  }
}
