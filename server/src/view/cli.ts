import { program } from 'commander'
import App from '@application/App'
import * as process from 'process'
import EmissionsByDayAndServiceTable from '@view/EmissionsByDayAndServiceTable'
import EmissionsByServiceTable from '@view/EmissionsByServiceTable'
import EmissionsByDayTable from '@view/EmissionsByDayTable'
import CliPrompts from './CliPrompts'
import { exportToCSV } from '@view/CSV'
import moment from 'moment'
import path from 'path'
import CreateValidRequest from '@application/CreateValidRequest'

export default async function cli(argv: string[] = process.argv) {
  program
    .option('-s, --startDate <string>', 'Start date in ISO format')
    .option('-e, --endDate <string>', 'End date in ISO format')
    .option('-r, --region <string>', 'AWS region to analyze')
    .option('-g, --groupBy <string>', 'Group results by day or service. Default is day.')
    .option('-i, --interactive', 'Use interactive CLI prompts')
    .option('-f, --format <string>', 'How to format the results [table, csv]. Default is table.')

  program.parse(argv)

  let startDate, endDate
  let region
  let groupBy: string
  let format: string

  if (program.interactive) {
    ;[startDate, endDate, region, groupBy, format] = await CliPrompts()
  } else {
    startDate = program.startDate
    endDate = program.endDate
    region = program.region
    groupBy = program.groupBy
    format = program.format
  }
  const estimationRequest = CreateValidRequest({ startDate, endDate, region })
  const { table, colWidths } = await new App().getCostAndEstimates(estimationRequest).then((estimations) => {
    if (groupBy === 'service') {
      return EmissionsByServiceTable(estimations)
    }
    if (groupBy === 'day') {
      return EmissionsByDayTable(estimations)
    }
    return EmissionsByDayAndServiceTable(estimations)
  })

  if (format === 'csv') {
    const filePath = path.join(process.cwd(), `results-${moment().utc().format('YYYY-MM-DD-HH:mm:ss')}.csv`)
    exportToCSV(table, filePath)
    return `File saved to: ${filePath}`
  } else {
    return table
      .map((row: string[]) => row.reduce((acc, data, col) => acc + `| ${data}`.padEnd(colWidths[col]), ''))
      .join('\n')
  }
}
