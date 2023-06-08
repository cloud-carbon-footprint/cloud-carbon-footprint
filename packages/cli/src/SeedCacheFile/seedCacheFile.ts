/*
 * © 2021 Thoughtworks, Inc.
 */

import moment, { Moment } from 'moment'
import { App, createValidFootprintRequest } from '@cloud-carbon-footprint/app'
import yargs from 'yargs';

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
  const argv = yargs
    .option('start', {
      alias: 's',
      default: '2022-01-01',
      describe: 'The start date of the estimate request',
      type: 'string',
    })
    .option('end', {
      alias: 'e',
      default: moment.utc().format('YYYY-MM-DD'),
      describe: 'The end date of the estimate request',
      type: 'string',
    })
    .option('groupBy', {
      alias: 'g',
      default: 'day',
      describe: 'The time interval to group the data by',
      choices: ['day', 'week', 'month'],
      type: 'string',
    })
    .option('fetchMethod', {
      alias: 'f',
      default: 'single',
      describe: 'The method to use for fetching estimates',
      choices: ['single', 'split'],
      type: 'string',
    })
    .option('cloudProviderToSeed', {
      alias: 'c',
      describe: 'The cloud provider to seed the cache file for',
      type: 'string',
    })
    .help()
    .alias('help', 'h')
    .argv;

  const start = argv.start;
  const end = argv.end;
  const groupBy = argv.groupBy;
  const fetchMethod = argv.fetchMethod;
  const cloudProviderToSeed = argv.cloudProviderToSeed;

  const currentDate = moment.utc(start)
  const endDate = moment.utc(end)

  // Grab the default length of the request window based on the provided date range
  let daysPerRequest = endDate.diff(currentDate, 'days') + 1
  if (fetchMethod === 'split') {
    daysPerRequest =
      parseInt(
        await new Promise((resolve) => {
          process.stdin.once('data', (data) => {
            resolve(data.toString().trim())
          })
          console.log('How many days would you like to fetch per request? [1]')
        }),
      ) || 1
  }

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

  // Makes getCostAndEstimates requests in chunks based on request method and day frequency
  while (currentDate.isSameOrBefore(endDate)) {
    // Use the current date window as the inclusive start/end date of the request
    let nextDate = currentDate.clone().add(daysPerRequest - 1, 'day')

    // Enforce end date as boundary if request window passes it
    if (nextDate.isAfter(endDate)) nextDate = endDate.clone()

    request.startDate = currentDate.toDate()
    request.endDate = nextDate.toDate()

    logRequestProgress(currentDate, nextDate)

    await app.getCostAndEstimates(request)

    // Slide to the beginning of the next date window
    currentDate.add(daysPerRequest, 'day')
  }

  console.info(
    `Done! Estimates have been successfully seeded to the cache file!`,
  )
}
