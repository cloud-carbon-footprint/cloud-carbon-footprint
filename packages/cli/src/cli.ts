/*
 * © 2021 Thoughtworks, Inc.
 */

import commander from 'commander'
import moment from 'moment'
import path from 'path'
import * as process from 'process'

import {
  App,
  createValidFootprintRequest,
  MongoDbCacheManager,
} from '@cloud-carbon-footprint/app'
import { EstimationResult, configLoader } from '@cloud-carbon-footprint/common'

import EmissionsByDayAndServiceTable from './EmissionsByDayAndServiceTable'
import EmissionsByServiceTable from './EmissionsByServiceTable'
import EmissionsByDayTable from './EmissionsByDayTable'
import CliPrompts from './CliPrompts'
import { exportToCSV } from './CSV'
import { validateCliInput } from './common/inputValidation'

export default async function cli(argv: string[] = process.argv) {
  const program = new commander.Command()
  program.storeOptionsAsProperties(false)

  program
    .option('-s, --startDate <string>', 'Start date in ISO format')
    .option('-e, --endDate <string>', 'End date in ISO format')
    .option(
      '-g, --groupBy <string>',
      'Group results by day or service. Default is day.',
    )
    .option('-i, --interactive', 'Use interactive CLI prompts')
    .option(
      '-f, --format <string>',
      'How to format the results [table, csv]. Default is table.',
    )

  program.parse(argv)

  let startDate, endDate
  let groupBy: string
  let format: string

  if (program.opts().interactive) {
    ;[startDate, endDate, groupBy, format] = await CliPrompts()
  } else {
    const programOptions = program.opts()
    startDate = programOptions.startDate
    endDate = programOptions.endDate
    groupBy = programOptions.groupBy
    format = programOptions.format

    if (!groupBy) {
      console.warn(
        'GroupBy parameter not specified, adopting "day" as the default.',
      )
      groupBy = 'day'
    }
  }
  validateCliInput({ groupBy })

  const estimationRequest = createValidFootprintRequest({
    startDate,
    endDate,
    groupBy: 'day', // So that estimates are cached the same regardless of table grouping method
  })

  if (configLoader().CACHE_MODE === 'MONGODB') {
    await MongoDbCacheManager.createDbConnection()
  }

  const { table, colWidths } = await new App()
    .getCostAndEstimates(estimationRequest)
    .then((estimations: EstimationResult[]) => {
      if (groupBy === 'service') {
        return EmissionsByServiceTable(estimations)
      }
      if (groupBy === 'day') {
        return EmissionsByDayTable(estimations)
      }
      return EmissionsByDayAndServiceTable(estimations)
    })

  if (configLoader().CACHE_MODE === 'MONGODB') {
    await MongoDbCacheManager.mongoClient.close()
    console.log('MongoDB connection closed')
  }

  if (format === 'csv') {
    const filePath = path.join(
      process.cwd(),
      `results-${moment().utc().format('YYYY-MM-DD-HH:mm:ss')}.csv`,
    )
    exportToCSV(table, filePath)
    return `File saved to: ${filePath}`
  } else {
    return table
      .map((row: string[]) =>
        row.reduce(
          (acc, data, col) => acc + `| ${data}`.padEnd(colWidths[col]),
          '',
        ),
      )
      .join('\n')
  }
}
