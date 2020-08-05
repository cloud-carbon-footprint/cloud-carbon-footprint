import fs from 'fs'

export const exportToCSV = (table: string[][]): void => {
  let output = ''
  table.forEach((row) => {
    output = output + row.join(',')
    output = output + '\n'
  })
  fs.writeFileSync('output.csv', output)
}
