/**
 * © 2021 Thoughtworks, Inc.
 */

import moment, { Moment } from 'moment'
import { Stream } from 'stream'
import { DelimitedStream } from '@sovpro/delimited-stream'
import {
  EstimationResult,
  getPeriodEndDate,
  GroupBy,
} from '@cloud-carbon-footprint/common'
import { EstimationRequest } from '../CreateValidRequest'
import R from 'ramda'

const DATA_WINDOW_SIZE = 100 // this roughly means 100 days per loop

export const writeToFile = async (
  writeStream: any,
  mergedData: EstimationResult[],
  fh?: any,
) => {
  const OPEN_BRACKET = '[' + '\n'
  const CLOSE_BRACKET = '\n' + ']'
  const COMMA_SEPARATOR = '\n' + ',' + '\n'

  async function writeIt(output: string) {
    fh
      ? await writeStream.appendFile(fh, output)
      : await writeStream.write(output)
  }

  await writeIt(OPEN_BRACKET) // beginning of the cache file
  for (let i = 0; i < mergedData.length; i += DATA_WINDOW_SIZE) {
    await writeIt(
      mergedData
        .slice(i, i + DATA_WINDOW_SIZE)
        .map((el) => JSON.stringify(el))
        .join(COMMA_SEPARATOR),
    ) // write a DATA_WINDOW_SIZE amount of data
    if (i + DATA_WINDOW_SIZE < mergedData.length) {
      await writeIt(COMMA_SEPARATOR)
    }
  }
  await writeIt(CLOSE_BRACKET) // end of the cache file
}

export const getCachedData = async (dataStream: Stream) => {
  const delimitedStream = await new DelimitedStream(Buffer.from('\n'))
  return await new Promise((resolve, reject) => {
    const arr: any = []
    delimitedStream.on('data', (data) => {
      const line = data.toString()
      if (isNotADataDelimiter(line)) {
        arr.push(JSON.parse(line, dateTimeReviver))
      }
    })
    delimitedStream.on('error', (err) => reject(err))
    delimitedStream.on('end', () => {
      resolve(arr)
    })
    dataStream.pipe(delimitedStream)
  })
  function isNotADataDelimiter(l: string) {
    // data delimiters are [, ], or empty line
    // and are encoded on writeToFile() function
    return !/^[\[\],\n]$/.test(l)
  }
}

const dateTimeReviver = (key: string, value: string) => {
  if (key === 'timestamp') return moment.utc(value).toDate()
  return value
}

/**
 * Returns the file name of the estimates cache.
 *
 * @param grouping Unit of measure that the data will be grouped by
 */
export function getCacheFileName(grouping: string): string {
  const cachePrefix = process.env.CCF_CACHE_PATH || 'estimates.cache'
  const existingFileExtension = cachePrefix.lastIndexOf('.json')
  const prefix =
    existingFileExtension !== -1
      ? cachePrefix.substr(0, existingFileExtension)
      : cachePrefix
  return `${prefix}.${grouping}.json`
}

/**
 * Grabs the estimates that should persist in the cache by removing empty estimates according to the provided missing dates
 * @param missingDates - An array of dates that are missing from the cache
 * @param estimates    - An array of estimates that are not in the cache
 * @param grouping     - The unit of time that the data is grouped by
 * @returns EstimationResult[] - An array of estimates that should be persisted in the cache
 */
export const fillDates = (
  missingDates: Moment[],
  estimates: EstimationResult[],
  grouping: GroupBy,
): EstimationResult[] => {
  const dates: Date[] = estimates.map(({ timestamp }) => {
    return timestamp
  })

  // converts missing dates to Date object to compare to estimate dates
  const missingDatesConverted: Date[] = missingDates.map((timestamp) => {
    return timestamp.toDate()
  })

  const difference = R.difference(missingDatesConverted, dates)
  const emptyEstimates = difference.map((timestamp) => {
    return {
      timestamp: timestamp,
      serviceEstimates: [],
      periodStartDate: timestamp,
      periodEndDate: getPeriodEndDate(timestamp, grouping),
      groupBy: grouping,
    }
  })
  return [...emptyEstimates, ...estimates].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  )
}

export const concat = (
  cachedEstimates: EstimationResult[],
  estimates: EstimationResult[],
) => {
  return [...cachedEstimates, ...estimates].sort((a, b) => {
    return a.timestamp.getTime() - b.timestamp.getTime()
  })
}

export const getDatesWithinRequestTimeFrame = (
  grouping: string,
  request: EstimationRequest,
): Moment[] => {
  const dates: Moment[] = []
  const unitOfTime =
    grouping === 'week' ? 'isoWeek' : (grouping as moment.unitOfTime.StartOf)
  const current = moment.utc(request.startDate).startOf(unitOfTime)
  const end = moment.utc(request.endDate)
  while (current <= end) {
    dates.push(current.clone())
    current.add(1, grouping as moment.unitOfTime.DurationConstructor)
  }
  return dates
}

/**
 * Returns a list of missing dates within the request according to the provided cached estimates
 * @param cachedEstimates - An array of cached estimates
 * @param request         - The original EstimationRequest
 * @returns Moment[]      - An array of missing dates
 */
export const getMissingDates = (
  cachedEstimates: EstimationResult[],
  request: EstimationRequest,
  grouping: string,
): Moment[] => {
  const cachedDates: Moment[] = cachedEstimates.map(({ timestamp }) => {
    return moment.utc(timestamp)
  })
  cachedDates.sort((a, b) => {
    return a.valueOf() - b.valueOf()
  })

  const missingDates: Moment[] = []
  const dates = getDatesWithinRequestTimeFrame(grouping, request)

  dates.forEach((date) => {
    const dateIsCached = !!cachedDates.find((cachedDate) => {
      return cachedDate.isSame(date)
    })

    if (!dateIsCached) missingDates.push(date)
  })
  return missingDates
}

// Filter out empty estimates
export const filterCachedEstimates = (
  cachedEstimates: EstimationResult[],
): EstimationResult[] => {
  return cachedEstimates.filter(({ serviceEstimates }) => {
    return serviceEstimates.length !== 0
  })
}

export const includeCloudProviders = (
  cloudProviderToSeed: string,
  config: any,
) => {
  const supportedCloudProviders = ['AWS', 'GCP', 'AZURE']
  if (cloudProviderToSeed) {
    supportedCloudProviders.forEach((cloudProvider: string) => {
      if (cloudProvider === cloudProviderToSeed.toUpperCase()) {
        config[cloudProvider].INCLUDE_ESTIMATES = true
      } else {
        config[cloudProvider].INCLUDE_ESTIMATES = false
      }
    })
  }
}
