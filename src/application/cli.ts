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
    .option('-i, --interactive', 'Use interactive CLI prompts')

  program.parse(argv)

  let startDate, endDate

  if (program.interactive) {
    ;[startDate, endDate] = await CliPrompts()
  } else {
    startDate = program.startDate
    endDate = program.endDate
  }
  const estimationRequest: RawRequest = { startDate, endDate }
  return await new App().getEstimate(estimationRequest).then(EmissionsTable)
}
