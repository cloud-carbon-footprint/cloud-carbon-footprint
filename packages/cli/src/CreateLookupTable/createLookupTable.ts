/*
 * © 2021 Thoughtworks, Inc.
 */
import process from 'process'
import commander from 'commander'
import csv from 'csvtojson'
import { createObjectCsvWriter } from 'csv-writer'
import path from 'path'

import { App } from '@cloud-carbon-footprint/app'
import {
  LookupTableInput,
  LookupTableOutput,
} from '@cloud-carbon-footprint/common'
import { validateInputData } from './validateInputData'

export default async function createLookupTable(
  argv: string[] = process.argv,
): Promise<void> {
  const program = new commander.Command()
  program.storeOptionsAsProperties(false)

  program
    .option('--awsInput <filename>', 'File containing relevant AWS input data')
    .option(
      '--awsOutput <filename>',
      'File to write the relevant AWS output data',
      'aws_lookup_data.csv',
    )

  program.parse(argv)

  const programOptions = program.opts()
  const awsInputFile = programOptions.awsInput
  const awsOutputFile = path.join(process.cwd(), programOptions.awsOutput)
  const inputData: LookupTableInput[] = await csv().fromFile(awsInputFile)

  validateInputData(inputData)

  const estimatesData: LookupTableOutput[] =
    await new App().getEstimatesFromInputData(inputData)

  const csvWriter = createObjectCsvWriter({
    path: awsOutputFile,
    header: [
      { id: 'serviceName', title: 'serviceName' },
      { id: 'region', title: 'region' },
      { id: 'usageType', title: 'usageType' },
      { id: 'usageUnit', title: 'usageUnit' },
      { id: 'vCpus', title: 'vCpus' },
      { id: 'kilowattHours', title: 'kilowattHours' },
      { id: 'co2e', title: 'co2e' },
    ],
  })
  await csvWriter.writeRecords(estimatesData)
}
