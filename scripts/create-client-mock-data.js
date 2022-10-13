/*
 * © 2021 Thoughtworks, Inc.
 */

const fs = require('fs')
const path = require('path')

async function main() {
  const data = fs.readFileSync(
    path.resolve(__dirname, `../packages/client/stub-server/mockData.json`),
    'utf8',
  )

  const mockData = JSON.parse(data)
  let updatedMonth = getPreviousMonth(new Date());

  mockData.footprint.forEach((footprint) => {
    footprint.timestamp = updatedMonth.toISOString()
    updatedMonth = getPreviousMonth(updatedMonth)
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

  Object.keys(mockData).forEach((key) => {
    const pathSuffix = key === 'emissions' ? `regions/${key}` : key

    fs.writeFile(
      path.resolve(
        __dirname,
        `../packages/client/stub-server/api/${pathSuffix}`,
      ),
      JSON.stringify(mockData[key]),
      (err) => {
        if (err) {
          console.error(err)
          return
        }
      },
    )
  })
}

function getPreviousMonth(timestamp) {
  let prevMonth = timestamp
  prevMonth.setDate(0)
  prevMonth.setDate(1)
  prevMonth.setUTCHours(0, 0, 0, 0)
  return prevMonth
}

main().catch((error) => {
  console.error(error.stack)
  process.exit(1)
})
