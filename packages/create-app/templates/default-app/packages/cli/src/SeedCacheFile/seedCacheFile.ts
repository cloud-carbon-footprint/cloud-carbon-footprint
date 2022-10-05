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

  const estimationRequest = createValidFootprintRequest({
    startDate,
    endDate,
    groupBy,
    limit: '1',
    skip: '0',
  })

  await new App()
    .getCostAndEstimates(estimationRequest)
    .then((estimations: EstimationResult[]) => {
      if (estimations) {
        console.info('Cache file has successfully been seeded!')
      }
    })
}
