/**
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { Stream } from 'stream'
import fs from 'fs'
import { DelimitedStream } from '@sovpro/delimited-stream'
import { EstimationResult } from '@cloud-carbon-footprint/common'

export const writeToFile = async (
  writeStream: any,
  mergedData: EstimationResult[],
  fh?: any,
) => {
  fh
    ? await writeStream.appendFile(fh, '[' + '\n')
    : await writeStream.write('[' + '\n')
  for (let i = 0; i < mergedData.length; i += 100) {
    const out = mergedData
      .slice(i, i + 100)
      .map((el) => JSON.stringify(el))
      .join('\n' + ',' + '\n')
    fh ? await writeStream.appendFile(fh, out) : await writeStream.write(out)
    if (i + 100 < mergedData.length) {
      fh
        ? await writeStream.appendFile(fh, '\n' + ',' + '\n')
        : await writeStream.write('\n' + ',' + '\n')
    }
  }
  fh
    ? await writeStream.appendFile(fh, '\n' + ']')
    : await writeStream.write('\n' + ']')
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
    return !/^[\[\]\n]$/.test(l)
  }
}

export const cacheExists = (cachePath: string): Promise<boolean> => {
  let cacheExists
  fs.access(cachePath, (err) => {
    if (err) {
      cacheExists = false
    }
    cacheExists = false
  })
  return cacheExists
}

const dateTimeReviver = (key: string, value: string) => {
  if (key === 'timestamp') return moment.utc(value).toDate()
  return value
}
