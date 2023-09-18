/*
 * © 2021 Thoughtworks, Inc.
 */

import moment, { Moment } from 'moment'
import { inputPrompt, listPrompt } from '../common'
import {
  App,
  createValidFootprintRequest,
  MongoDbCacheManager,
} from '@cloud-carbon-footprint/app'
import { configLoader } from '@cloud-carbon-footprint/common'

/**
 * Logs the progress of the estimate request based on the given date range
 * @param startDate The intended start date of the next request
 * @param endDate   The intended end date of the next request
 */
function logRequestProgress(startDate: Moment, endDate?: Moment) {
  if (startDate.isSame(endDate)) {
    console.info(`Fetching estimates for ${startDate.format('YYYY-MM-DD')}...`)
  } else {
    console.info(
      `Fetching estimates from ${startDate.format(
        'YYYY-MM-DD',
      )} to ${endDate.format('YYYY-MM-DD')}...`,
    )
  }
}

export default async function seedCacheFile(): Promise<void> {
  const start = await inputPrompt('Please enter start date: ')
  const end = await inputPrompt('Please enter end date: ')
  const groupBy = await listPrompt(
    'Please select how to group results by [day]: ',
    ['day', 'week', 'month', 'quarter', 'year'],
    'day',
  )
  const fetchMethod = await listPrompt(
    'Please specify a fetch method for the request [single]:',
    ['single', 'split'],
    'single',
  )

  const currentDate = moment.utc(start)
  const endDate = moment.utc(end)

  // Grab the default length of the request window based on the provided date range
  let timePerRequest =
    endDate.diff(currentDate, `${groupBy}s` as moment.unitOfTime.Diff) + 1
  if (fetchMethod === 'split') {
    timePerRequest =
      parseInt(
        await inputPrompt(
          `How many ${groupBy}s would you like to fetch per request? [1]`,
        ),
      ) || 1
  }

  const cloudProviderToSeed = await inputPrompt(
    'If you are using the MongoDB cache mode and only want to seed data from a specific cloud provider, please enter cloud provider [aws|gcp|azure] or press enter to skip: ',
    false,
  )

  const app = new App()

  const request = createValidFootprintRequest({
    startDate: currentDate.toISOString(),
    endDate: endDate.toISOString(),
    groupBy,
    cloudProviderToSeed,
    limit: '1',
    skip: '0',
  })

  console.info(
    `Seeding cache file using ${
      fetchMethod === 'single' ? 'a single request' : 'split requests'
    }...`,
  )

  if (configLoader().CACHE_MODE === 'MONGODB') {
    await MongoDbCacheManager.createDbConnection()
  }

  // Makes getCostAndEstimates requests in chunks based on request method and time frequency
  while (currentDate.isSameOrBefore(endDate)) {
    // Use the current date window as the inclusive start/end date of the request
    let nextDate = currentDate
      .clone()
      .add(timePerRequest - 1, groupBy as moment.unitOfTime.DurationConstructor)

    // Enforce end date as boundary if request window passes it
    if (nextDate.isAfter(endDate)) nextDate = endDate.clone()

    request.startDate = currentDate.toDate()
    request.endDate = nextDate.toDate()

    logRequestProgress(currentDate, nextDate)

    await app.getCostAndEstimates(request)

    // Slide to the beginning of the next date window
    currentDate.add(
      timePerRequest,
      groupBy as moment.unitOfTime.DurationConstructor,
    )
  }

  if (configLoader().CACHE_MODE === 'MONGODB') {
    await MongoDbCacheManager.mongoClient.close()
    console.info('MongoDB connection closed')
  }

  console.info(
    `Done! Estimates have been successfully seeded to the cache file!`,
  )
}
