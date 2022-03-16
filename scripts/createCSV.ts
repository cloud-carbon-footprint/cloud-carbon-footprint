/*
 * © 2021 Thoughtworks, Inc.
 */

import { createObjectCsvWriter } from "csv-writer";
import {
    lambdaComputeOptimizer,
} from '../packages/aws/src/__tests__/fixtures/computeOptimizer.fixtures'

async function writeCSV() {
    const mockData = lambdaComputeOptimizer
    const path = '../packages/aws/src/__tests__/fixtures/computeOptimizerLambda.csv'
    const header = Object.keys(mockData[0]).map(key => ({id: key, title: key}))

    const csvWriter = createObjectCsvWriter({path, header})
    await csvWriter.writeRecords(mockData)
}

writeCSV()
