/**
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { Stream } from 'stream'
import { DelimitedStream } from '@sovpro/delimited-stream'
import { EstimationResult } from '@cloud-carbon-footprint/common'

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
export function getCacheFileName(grouping: string, subscriptionIds?: string): string {
  const cachePrefix = process.env.CCF_CACHE_PATH || 'estimates.cache'
  const existingFileExtension = cachePrefix.lastIndexOf('.json')
  const subscriptionIdsPart = subscriptionIds === undefined ? '' : getHash(subscriptionIds)
  const prefix =
    existingFileExtension !== -1
      ? cachePrefix.substr(0, existingFileExtension)
      : cachePrefix
  return `${prefix}.${grouping}${subscriptionIdsPart}.json`
}

export function getHash(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}