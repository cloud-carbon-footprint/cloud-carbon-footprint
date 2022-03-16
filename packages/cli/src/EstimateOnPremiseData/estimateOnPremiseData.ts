/*
 * © 2021 Thoughtworks, Inc.
 */
import process from 'process'
import commander from 'commander'
import csv from 'csvtojson'
import path from 'path'

import { App } from '@cloud-carbon-footprint/app'
import {
  OnPremiseDataInput,
  OnPremiseDataOutput,
} from '@cloud-carbon-footprint/common'
import { validateInputData } from './validateInputData'
import { writeToCsv } from './writeToCsv'

export default async function estimateOnPremiseData(
  argv: string[] = process.argv,
): Promise<void> {
  const program = new commander.Command()
  program.storeOptionsAsProperties(false)

  program
    .option(
      '--onPremiseInput <filename>',
      'File containing relevant On-Premise input data',
    )
    .option(
      '--onPremiseOutput <filename>',
      'File to write the relevant On-Premise output data',
      'on_premise_estimations.csv',
    )

  program.parse(argv)

  const programOptions = program.opts()

  const onPremiseInputFile = programOptions.onPremiseInput
  const onPremiseOutputFile = path.join(
    process.cwd(),
    programOptions.onPremiseOutput,
  )

  if (onPremiseInputFile) {
    const onPremiseInputData: OnPremiseDataInput[] = await csv().fromFile(
      onPremiseInputFile,
    )
    validateInputData(onPremiseInputData)
    const onPremiseEstimatesData: OnPremiseDataOutput[] =
      new App().getOnPremiseEstimatesFromInputData(onPremiseInputData)
    await writeToCsv(onPremiseOutputFile, onPremiseEstimatesData)
  }
}
