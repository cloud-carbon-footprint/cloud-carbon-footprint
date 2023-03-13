/*
 * © 2021 Thoughtworks, Inc.
 */

import { EstimationResult } from '@cloud-carbon-footprint/common'
import moment from 'moment'
import { inputPrompt, listPrompt } from '../common'
import { App, createValidFootprintRequest } from '@cloud-carbon-footprint/app'

export default async function seedCacheFile(): Promise<void> {
  const startDate = await inputPrompt('Please enter start date: ')
  const endDate = await inputPrompt('Please enter end date: ')
  const groupBy = await listPrompt(
    'Please enter how to group results by [day]: ',
    ['day', 'week', 'month', 'quarter', 'year'],
    'day',
  )
  const fetchMethod = await listPrompt(
    'Please specify a fetch method for the request [single]:',
    ['single', 'split'],
    'single',
  )
  const cloudProviderToSeed = await inputPrompt(
    'If you are using the MongoDB cache mode and only want to seed data from a specific cloud provider, please enter cloud provider [aws|gcp|azure] or press enter to skip: ',
    false,
  )

  const app = new App()

  let currentDate = moment.utc(startDate)
  const finalDate = moment.utc(endDate)

  console.info(
    `Seeding cache file using ${
      fetchMethod === 'single' ? 'a single request' : 'split requests'
    }...`,
  )

  while (currentDate.isBefore(finalDate)) {
    console.info(
      `Fetching estimates for ${currentDate.format('YYYY-MM-DD')}...`,
    )

    const currentEndDate =
      fetchMethod === 'single' ? finalDate : moment(currentDate).add(1, 'day')
    const estimationRequest = createValidFootprintRequest({
      startDate: currentDate.toISOString(),
      endDate: currentEndDate.toISOString(),
      groupBy,
      cloudProviderToSeed,
      limit: '1',
      skip: '0',
    })

    await app.getCostAndEstimates(estimationRequest)
    currentDate = currentEndDate
  }
  console.info(
    `Done! Estimates have been successfully seeded to the cache file!`,
  )
  process.exit(0)
}
