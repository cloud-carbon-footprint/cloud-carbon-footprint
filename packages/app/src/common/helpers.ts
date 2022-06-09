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
