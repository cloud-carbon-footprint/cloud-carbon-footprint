/*
 * © 2021 Thoughtworks, Inc.
 */

const fs = require('fs')
const path = require('path')
const moment = require('moment')

async function update() {
  const data = fs.readFileSync(
    path.resolve(__dirname, `../packages/client/stub-server/mockData.json`),
    'utf8',
  )

  const mockData = JSON.parse(data)
  let updatedMonth = moment().startOf('month')

  mockData.footprint.forEach((footprint) => {
    footprint.timestamp = updatedMonth.toISOString()
    updatedMonth = getPreviousMonth(updatedMonth)

    footprint.serviceEstimates.forEach((serviceEstimate) => {
      const regionObj = mockData.emissions.find(o => o.region === serviceEstimate.region)
      const { mtPerKwHour } = regionObj
      const updatedC02e = serviceEstimate.kilowattHours * mtPerKwHour
      serviceEstimate.co2e = updatedC02e
    })
  })

  mockData.recommendations.forEach((recommendation) => {
    const regionObj = mockData.emissions.find(o => o.region === recommendation.region)
    const { mtPerKwHour } = regionObj
    const updatedC02e = recommendation.kilowattHourSavings * mtPerKwHour
    recommendation.co2eSavings = updatedC02e
  })

  fs.writeFileSync(
    path.resolve(__dirname, `../packages/client/stub-server/mockData.json`),
    JSON.stringify(mockData),
    (err) => {
      if (err) {
        console.error(err)
      }
    },
  )

  const mockDataPath = `../packages/api/mock-estimates.json`
  await fileHandle(mockDataPath, mockData.footprint)
}

const getPreviousMonth = (timestamp) => timestamp.subtract(1, 'months').startOf('month')

// writes updates estimates to api mock data file in stream format
const fileHandle = async (mockDataFile, estimates) =>{
  let fh = null
  try {
    await fs.promises.writeFile(path.resolve(__dirname, mockDataFile), '', () =>{})
    fh = await fs.promises.open(path.resolve(__dirname, mockDataFile), 'r+')
    await writeToFile(fs.promises, estimates, fh)
  } catch (err) {
    console.warn(`Setting estimates error: ${err.message}`)
  } finally {
    if (fh) {
      await fh.close()
    }
  }
}

const writeToFile = async (
    writeStream,
    mergedData,
    fh,
) => {
  const openBracket = '[' + '\n'
  const closeBracket = '\n' + ']'
  const commaSeparator = '\n' + ',' + '\n'
  const dataWindowSize = 100 // this roughly means 100 days per loop

  async function writeIt(output) {
    fh
        ? await writeStream.appendFile(fh, output)
        : await writeStream.write(output)
  }

  await writeIt(openBracket)
  for (let i = 0; i < mergedData.length; i += dataWindowSize) {
    await writeIt(
        mergedData
            .slice(i, i + dataWindowSize)
            .map((el) => JSON.stringify(el))
            .join(commaSeparator),
    )
    if (i + dataWindowSize < mergedData.length) {
      await writeIt(commaSeparator)
    }
  }
  await writeIt(closeBracket)
}


update().catch((error) => {
  console.error(error.stack)
  process.exit(1)
})

module.exports = { update }