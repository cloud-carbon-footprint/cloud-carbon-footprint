import { program } from 'commander'
import { App } from './App'
import * as console from 'console'
import * as process from 'process'
import CliParams from './CliParams'
import { EstimationRequest } from './EstimationRequest'
import EmissionsTable from './EmissionsTable'
import CliPrompts from './CliPrompts'

program
  .option('-s, --startDate <string>', 'Start date in ISO format')
  .option('-e, --endDate <string>', 'End date in ISO format')
  .option('-i, --interactive', 'Use interctive CLI prompts')

program.parse(process.argv)

let startDate, endDate

async function cli() {
  if (program.interactive) {
    ;[startDate, endDate] = await CliPrompts()
  } else {
    startDate = program.startDate
    endDate = program.endDate
  }
  const estimationRequest: EstimationRequest = CliParams({ startDate, endDate })
  new App().getEstimate(estimationRequest).then(EmissionsTable).then(console.log)
}

cli()
