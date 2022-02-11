/*
 * © 2021 Thoughtworks, Inc.
 */

import { createObjectCsvWriter } from "csv-writer";
import {
    ebsComputeOptimizer,
    ec2ComputeOptimizer,
} from '../packages/aws/src/__tests__/fixtures/computeOptimizer.fixtures'

async function writeCSV() {
    const mockData = ebsComputeOptimizer
    const path = '../packages/aws/src/__tests__/fixtures/computeOptimizerEBS.csv'
    const header = Object.keys(mockData[0]).map(key => ({id: key, title: key}))

    const csvWriter = createObjectCsvWriter({path, header})
    await csvWriter.writeRecords(mockData)
}

writeCSV()
