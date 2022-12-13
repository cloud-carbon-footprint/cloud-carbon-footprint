/*
 * © 2021 Thoughtworks, Inc.
 */

import { inputPrompt } from '../common'
import { App, createValidFootprintRequest } from '@cloud-carbon-footprint/app'
import { EstimationResult } from '@cloud-carbon-footprint/common'

export default async function seedCacheFile(): Promise<void> {
  const startDate = await inputPrompt('Please enter start date: ')
  const endDate = await inputPrompt('Please enter end date: ')
  const groupBy = await inputPrompt(
    'Please enter how to group results by [day|week|month|quarter|year]: ',
  )
  const cloudProviderToSeed = await inputPrompt(
    'If you are using the MongoDB cache mode and only want to seed data from a specific cloud provider, please enter cloud provider [aws|gcp|azure] or press enter to skip: ',
    false,
  )

  const estimationRequest = createValidFootprintRequest({
    startDate,
    endDate,
    groupBy,
    cloudProviderToSeed,
    limit: '1',
    skip: '0',
  })

  await new App()
    .getCostAndEstimates(estimationRequest)
    .then((estimations: EstimationResult[]) => {
      if (estimations) {
        console.info('Cache file has successfully been seeded!')
        process.exit(0)
      }
    })
}
