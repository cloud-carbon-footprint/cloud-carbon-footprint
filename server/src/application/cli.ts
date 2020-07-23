import { program } from 'commander'
import { App } from './App'
import * as process from 'process'
import { RawRequest } from './EstimationRequest'
import EmissionsTable from './EmissionsTable'
import CliPrompts from './CliPrompts'

export default async function cli(argv: string[] = process.argv) {
  program
    .option('-s, --startDate <string>', 'Start date in ISO format')
    .option('-e, --endDate <string>', 'End date in ISO format')
    .option('-r, --region <string>', 'AWS region to analyze')
    .option('-i, --interactive', 'Use interactive CLI prompts')

  program.parse(argv)

  let startDate, endDate
  let region

  if (program.interactive) {
    ;[startDate, endDate, region] = await CliPrompts()
  } else {
    startDate = program.startDate
    endDate = program.endDate
    region = program.region
  }
  const estimationRequest: RawRequest = { startDate, endDate, region }
  const { table, colWidths } = await new App().getEstimate(estimationRequest).then(EmissionsTable)

  return table
    .map((row: string[]) => row.reduce((acc, data, col) => acc + `| ${data}`.padEnd(colWidths[col]), ''))
    .join('\n')
}
