/*
 * © 2021 Thoughtworks, Inc.
 */
import process from 'process'
import commander from 'commander'
import csv from 'csv-parser'
import { createObjectCsvWriter } from 'csv-writer'
import fs from 'fs'
import { CloudWatch, CloudWatchLogs, CostExplorer } from 'aws-sdk'
import { Athena as AWSAthena } from 'aws-sdk'
import {
  AWS_CLOUD_CONSTANTS,
  CostAndUsageReports,
  CostAndUsageReportsRow,
  ServiceWrapper,
} from '@cloud-carbon-footprint/aws'
import {
  ComputeEstimator,
  MemoryEstimator,
  NetworkingEstimator,
  StorageEstimator,
} from '@cloud-carbon-footprint/core'
import path from 'path'

interface Record {
  serviceName: string
  region: string
  usageType: string
  usageUnit: string
  vCpus: string
}

export default async function createLookupTable(
  argv: string[] = process.argv,
): Promise<void> {
  const program = new commander.Command()
  const cur = new CostAndUsageReports(
    new ComputeEstimator(),
    new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
    new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
    new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
    new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    new ServiceWrapper(
      new CloudWatch(),
      new CloudWatchLogs(),
      new CostExplorer(),
      new AWSAthena(),
    ),
  )

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

  if (awsInputFile) {
    const data: any[] = []
    return new Promise((resolve, reject) => {
      fs.createReadStream(awsInputFile)
        .pipe(csv())
        .on('data', (row: Record) => {
          const costAndUsageReportRow = new CostAndUsageReportsRow(
            {
              Data: [
                { VarCharValue: 'timestamp' },
                { VarCharValue: 'accountName' },
                { VarCharValue: 'serviceName' },
                { VarCharValue: 'region' },
                { VarCharValue: 'usageType' },
                { VarCharValue: 'usageUnit' },
                { VarCharValue: 'vCpus' },
                { VarCharValue: 'cost' },
                { VarCharValue: 'usageAmount' },
              ],
            },
            [
              { VarCharValue: '2021-08-10T00:00:00Z' },
              { VarCharValue: '1234567890' },
              { VarCharValue: row.serviceName },
              { VarCharValue: row.region },
              { VarCharValue: row.usageType },
              { VarCharValue: row.usageUnit },
              { VarCharValue: row.vCpus },
              { VarCharValue: '1' },
              { VarCharValue: '1' },
            ],
          )
          const footprintEstimate = cur.getEstimateByPricingUnit(
            costAndUsageReportRow,
          )
          if (footprintEstimate) {
            data.push({
              usageType: row.usageType,
              serviceName: row.serviceName,
              region: row.region,
              usageUnit: row.usageUnit,
              vCpus: row.vCpus,
              kilowattHours: footprintEstimate.kilowattHours,
              co2e: footprintEstimate.co2e,
              usesAverageCPUConstant: footprintEstimate.usesAverageCPUConstant,
            })
          }
        })
        .on('end', async () => {
          const csvWriter = createObjectCsvWriter({
            path: awsOutputFile,
            header: [
              { id: 'usageType', title: 'usageType' },
              { id: 'serviceName', title: 'serviceName' },
              { id: 'region', title: 'region' },
              { id: 'vCpus', title: 'vCpus' },
              { id: 'kilowattHours', title: 'kilowattHours' },
              { id: 'usesAverageCPUConstant', title: 'usesAverageCPUConstant' },
              { id: 'co2e', title: 'co2e' },
            ],
          })
          await csvWriter
            .writeRecords(data)
            .then(() => console.log('The CSV file was written successfully'))
          return resolve()
        })
        .on('error', reject)
    })
  }
}
