/*
 * © 2021 Thoughtworks, Inc.
 */

import commander from 'commander'
import moment from 'moment'
import path from 'path'
import * as process from 'process'
import AWS, {
  CloudWatch,
  CloudWatchLogs,
  CostExplorer,
  Athena as AWSAthena,
} from 'aws-sdk'

import {
  FootprintEstimate,
  MutableEstimationResult,
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  StorageUsage,
  NetworkingUsage,
  appendOrAccumulateEstimatesByDay,
  CloudConstantsEmissionsFactors,
  CloudConstants,
} from '@cloud-carbon-footprint/core'

import { App, CreateValidFootprintRequest } from '@cloud-carbon-footprint/app'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { CostAndUsageReportsRow, CostAndUsageReports, ServiceWrapper, AWS_CLOUD_CONSTANTS } from '@cloud-carbon-footprint/aws'


interface Record {
  serviceName: string
  region: string
  usageType: string
  usageUnit: string
  vCpus: string
}

export default async function lookupExport(argv: string[] = process.argv) {
  const program = new commander.Command()
  const csv = require('csv-parser');
  const fs = require('fs');
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const cur = new CostAndUsageReports(new ComputeEstimator(),
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
  );

  program.storeOptionsAsProperties(false)

  program
    .option('--awsInput <filename>', 'File containing relevant AWS input data')
    .option('--awsOutput <filename>', 'File to write the relevant AWS output data', 'aws_lookup_data.csv')
    .option('--gcpInput <filename>', 'File containing relevant GCP input data')
    .option('--gcpOutput <filename>', 'File to write the relevant GCP output data', 'gcp_lookup_data.csv')
    .option('--azureInput <filename>', 'File containing relevant Azure input data')
    .option('--azureOutput <filename>', 'File to write the relevant Azure output data', 'azure_lookup_data.csv')

  program.parse(argv)

  let awsInputFile: string
  let awsOutputFile: string
  let gcpInputFile, gcpOutputFile
  let azureInputFile, azureOutputFile

  const programOptions = program.opts()
  awsInputFile = programOptions.awsInput
  awsOutputFile = programOptions.awsOutput
  gcpInputFile = programOptions.gcpInput
  gcpOutputFile = programOptions.gcpOutput
  azureInputFile = programOptions.azureInput
  azureOutputFile = programOptions.azureOutput
  if (awsInputFile) {
    console.log('Processing AWS data from ' + awsInputFile)
    let data: Array<object> = [];
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
          ]
        },
        [
          { VarCharValue: "2021-08-10T00:00:00Z" },
          { VarCharValue: "1234567890" },
          { VarCharValue: row.serviceName },
          { VarCharValue: row.region },
          { VarCharValue: row.usageType },
          { VarCharValue: row.usageUnit },
          { VarCharValue: row.vCpus },
          { VarCharValue: "1" },
          { VarCharValue: "1" },
        ])
        const footprintEstimate = cur.getEstimateByPricingUnit(costAndUsageReportRow);
        if(footprintEstimate) {
          data.push({
            usageType: row.usageType,
            serviceName: row.serviceName,
            region: row.region,
            usageUnit: row.usageUnit,
            vCpus: row.vCpus,
            kilowattHours: footprintEstimate.kilowattHours,
            co2e: footprintEstimate.co2e,
            usesAverageCPUConstant: footprintEstimate.usesAverageCPUConstant,
          }
          );
        }
      })
      .on('end', () => {
        console.log('Writing to ' + awsOutputFile);
        const csvWriter = createCsvWriter({
          path: awsOutputFile,
          header: [
            {id: 'usageType', title: 'usageType'},
            {id: 'serviceName', title: 'serviceName'},
            {id: 'region', title: 'region'},
            {id: 'vCpus', title: 'vCpus'},
            {id: 'kilowattHours', title: 'kilowattHours'},
            {id: 'usesAverageCPUConstant', title: 'usesAverageCPUConstant'},
            {id: 'co2e', title: 'co2e'},
          ]
        });
        
        csvWriter.writeRecords(data)
                 .then(()=> console.log('The CSV file was written successfully'));
    });
  }
  if (gcpInputFile) {
    console.log('Warning: Not Implemented')
  }
  if (azureInputFile) {
    console.log('Warning: Not Implemented')
  }
  return 'Success'
}
