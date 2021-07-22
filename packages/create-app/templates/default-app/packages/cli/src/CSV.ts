/*
 * © 2021 Thoughtworks, Inc.
 */

import fs from 'fs'

export const exportToCSV = (contents: string[][], filePath: string): void => {
  let output = ''
  contents.forEach((row) => {
    output = output + row.join(',')
    output = output + '\n'
  })
  fs.writeFileSync(filePath, output)
}
