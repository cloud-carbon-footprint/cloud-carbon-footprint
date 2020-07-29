import { program } from 'commander'
import { App } from '@application/App'
import * as process from 'process'
import { RawRequest } from '@application/EstimationRequest'
import EmissionsByDayTable from '@view/EmissionsByDayTable'
import EmissionsByServiceTable from '@view/EmissionsByServiceTable'
import CliPrompts from './CliPrompts'

export default async function cli(argv: string[] = process.argv) {
  program
    .option('-s, --startDate <string>', 'Start date in ISO format')
    .option('-e, --endDate <string>', 'End date in ISO format')
    .option('-r, --region <string>', 'AWS region to analyze')
    .option('-g, --groupBy <string>', 'Group results by day or service. Default is day.')
    .option('-i, --interactive', 'Use interactive CLI prompts')

  program.parse(argv)

  let startDate, endDate
  let region
  let groupBy: string

  if (program.interactive) {
    ;[startDate, endDate, region, groupBy] = await CliPrompts()
  } else {
    startDate = program.startDate
    endDate = program.endDate
    region = program.region
    groupBy = program.groupBy
  }
  const estimationRequest: RawRequest = { startDate, endDate, region }
  const { table, colWidths } = await new App().getEstimate(estimationRequest).then((estimations) => {
    if (groupBy === 'service') {
      return EmissionsByServiceTable(estimations)
    }
    return EmissionsByDayTable(estimations)
  })

  return table
    .map((row: string[]) => row.reduce((acc, data, col) => acc + `| ${data}`.padEnd(colWidths[col]), ''))
    .join('\n')
}
