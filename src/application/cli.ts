import { program } from 'commander'
import { App } from './App'
import * as console from 'console'
import * as process from 'process'
import CliParams from './CliParams'
import { EstimationRequest } from './EstimationRequest'
import EmissionsTable from './EmissionsTable'

program
  .requiredOption('-s, --startDate <string>', 'Start date in ISO format')
  .requiredOption('-e, --endDate <string>', 'End date in ISO format')

program.parse(process.argv)

const startDate = program.startDate
const endDate = program.endDate

const estimationRequest: EstimationRequest = CliParams({ startDate, endDate })

new App().getEstimate(estimationRequest).then(EmissionsTable).then(console.log)
