/*
 * © 2021 Thoughtworks, Inc.
 */
import process from 'process'
import commander from 'commander'
import csv from 'csvtojson'
import path from 'path'

import { App } from '@cloud-carbon-footprint/app'
import {
  LookupTableInput,
  LookupTableOutput,
} from '@cloud-carbon-footprint/common'
import { validateInputData } from './validateInputData'
import { writeToCsv } from './writeToCsv'

export default async function createLookupTable(
  argv: string[] = process.argv,
): Promise<void> {
  const program = new commander.Command()
  program.storeOptionsAsProperties(false)

  program
    .option('--awsInput <filename>', 'File containing relevant AWS input data')
    .option('--gcpInput <filename>', 'File containing relevant GCP input data')
    .option(
      '--awsOutput <filename>',
      'File to write the relevant AWS output data',
      'aws_lookup_data.csv',
    )
    .option(
      '--gcpOutput <filename>',
      'File to write the relevant AWS output data',
      'gcp_lookup_data.csv',
    )

  program.parse(argv)

  const programOptions = program.opts()

  const awsInputFile = programOptions.awsInput
  const awsOutputFile = path.join(process.cwd(), programOptions.awsOutput)

  const gcpInputFile = programOptions.gcpInput
  const gcpOutputFile = path.join(process.cwd(), programOptions.gcpOutput)

  if (awsInputFile) {
    const awsInputData: LookupTableInput[] = await csv().fromFile(awsInputFile)
    validateInputData(awsInputData)
    const awsEstimatesData: LookupTableOutput[] =
      await new App().getAwsEstimatesFromInputData(awsInputData)
    await writeToCsv(awsOutputFile, awsEstimatesData)
  }

  if (gcpInputFile) {
    const gcpInputData: LookupTableInput[] = await csv().fromFile(gcpInputFile)
    validateInputData(gcpInputData)
    const gcpEstimatesData: LookupTableOutput[] =
      await new App().getGcpEstimatesFromInputData(gcpInputData)
    await writeToCsv(gcpOutputFile, gcpEstimatesData)
  }
}
