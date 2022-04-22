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
      '--azureInput <filename>',
      'File containing relevant Azure input data',
    )
    .option(
      '--awsOutput <filename>',
      'File to write the relevant AWS output data',
      'aws_lookup_data.csv',
    )
    .option(
      '--gcpOutput <filename>',
      'File to write the relevant GCP output data',
      'gcp_lookup_data.csv',
    )
    .option(
      '--azureOutput <filename>',
      'File to write the relevant Azure output data',
      'azure_lookup_data.csv',
    )

  program.parse(argv)

  const programOptions = program.opts()

  const awsInputFile = programOptions.awsInput
  const awsOutputFile = path.join(process.cwd(), programOptions.awsOutput)

  const gcpInputFile = programOptions.gcpInput
  const gcpOutputFile = path.join(process.cwd(), programOptions.gcpOutput)

  const azureInputFile = programOptions.azureInput
  const azureOutputFile = path.join(process.cwd(), programOptions.azureOutput)

  if (awsInputFile) {
    const awsInputData: LookupTableInput[] = await csv().fromFile(awsInputFile)
    validateInputData(awsInputData)
    const awsEstimatesData: LookupTableOutput[] =
      new App().getAwsEstimatesFromInputData(awsInputData)
    await writeToCsv(awsOutputFile, awsEstimatesData)
  }

  if (gcpInputFile) {
    const gcpInputData: LookupTableInput[] = await csv().fromFile(gcpInputFile)
    validateInputData(gcpInputData)
    const gcpEstimatesData: LookupTableOutput[] =
      new App().getGcpEstimatesFromInputData(gcpInputData)
    await writeToCsv(gcpOutputFile, gcpEstimatesData)
  }

  if (azureInputFile) {
    const azureInputData: LookupTableInput[] = await csv().fromFile(
      azureInputFile,
    )
    validateInputData(azureInputData)
    const azureEstimatesData: LookupTableOutput[] =
      new App().getAzureEstimatesFromInputData(azureInputData)
    await writeToCsv(azureOutputFile, azureEstimatesData)
  }
}
