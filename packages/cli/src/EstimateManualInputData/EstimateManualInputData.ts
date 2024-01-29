/*
 * © 2024 Thoughtworks, Inc.
 */

import commander from 'commander'
import path from 'path'
import csv from 'csvtojson'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { App } from '@cloud-carbon-footprint/app'
import process from 'process'
import { createObjectCsvWriter } from 'csv-writer'

export default async function estimateManualInputData(
  argv: string[] = process.argv,
): Promise<void> {
  const program = new commander.Command()
  program.storeOptionsAsProperties(false)

  program
    .option(
      '--input <filename>',
      'File containing relevant manual input data',
      'manual_input_data.csv',
    )
    .option(
      '--output <filename>',
      'File to write the relevant output data',
      'manual_output_data.csv',
    )

  program.parse(argv)

  const programOptions = program.opts()

  let inputFile = programOptions.input
  await changeCsvHeadersToCamelCase(inputFile, 'formatted-input.csv')
  inputFile = 'formatted-input.csv'

  const outputFile = path.join(process.cwd(), programOptions.output)

  const inputData: any[] = await csv().fromFile(inputFile)

  // Data is flat like ModernUsageDetail. This is just a hack to make the spike work
  inputData.forEach((inputData) => {
    inputData.kind = 'modern'
  })

  const estimatesData: EstimationResult[] =
    await new App().getAzureEstimatesFromManualBillingInputData(inputData)

  await outputToCSV(estimatesData, outputFile)
}

async function outputToCSV(estimateData: EstimationResult[], filePath: string) {
  const dataToWrite = []

  for (const estimate of estimateData) {
    for (const serviceEstimate of estimate.serviceEstimates) {
      dataToWrite.push({
        timestamp: estimate.timestamp,
        cloudProvider: serviceEstimate.cloudProvider,
        serviceName: serviceEstimate.serviceName,
        accountName: serviceEstimate.accountName,
        accountId: serviceEstimate.accountId,
        kilowattHours: serviceEstimate.kilowattHours,
        co2e: serviceEstimate.co2e,
        region: serviceEstimate.region,
      })
    }
  }

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'timestamp', title: 'timestamp' },
      { id: 'cloudProvider', title: 'cloudProvider' },
      { id: 'serviceName', title: 'serviceName' },
      { id: 'accountName', title: 'accountName' },
      { id: 'accountId', title: 'accountId' },
      { id: 'kilowattHours', title: 'kilowattHours' },
      { id: 'co2e', title: 'co2e' },
      { id: 'region', title: 'region' },
    ],
  })

  await csvWriter.writeRecords(dataToWrite)
}

function toCamelCase(str: string): string {
  return str
    .replace(/\s(.)/g, function (a) {
      return a.toUpperCase()
    })
    .replace(/\s/g, '')
    .replace(/^(.)/, function (b) {
      return b.toLowerCase()
    })
}

// Function to change CSV headers to camelCase
async function changeCsvHeadersToCamelCase(
  inputFilePath: string,
  outputFilePath: string,
): Promise<void> {
  const jsonArray: any[] = await csv().fromFile(inputFilePath)

  if (jsonArray.length > 0) {
    const headers = Object.keys(jsonArray[0])
    const camelCaseHeaders = headers.map((header) => toCamelCase(header))

    const csvWriter = createObjectCsvWriter({
      path: outputFilePath,
      header: camelCaseHeaders.map((header) => ({ id: header, title: header })),
    })

    const records = jsonArray.map((record) => {
      const newRecord: { [key: string]: any } = {}
      camelCaseHeaders.forEach((header, index) => {
        newRecord[header] = record[headers[index]]
      })
      return newRecord
    })

    await csvWriter.writeRecords(records)
  }
}
