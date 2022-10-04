/*
 * © 2021 Thoughtworks, Inc.
 */

const fs = require('fs')
const path = require('path')

const prevMonth = new Date().getMonth() - 1
let updatedMonth = new Date(2022, prevMonth, 26)
updatedMonth.setUTCHours(0, 0, 0, 0)

async function main() {
  const data = fs.readFileSync(
    path.resolve(__dirname, `../packages/client/stub-server/mockData.json`),
    'utf8',
  )

  const mockData = JSON.parse(data)

  mockData.footprint.forEach((footprint) => {
    let updatedMonthStr = updatedMonth.toISOString()
    footprint.timestamp = updatedMonthStr
    updatedMonth = getPreviousMonth(updatedMonth)
    updatedMonth.setUTCHours(0, 0, 0, 0)
  })

  fs.writeFile(
    path.resolve(__dirname, `../packages/client/stub-server/mockData.json`),
    JSON.stringify(mockData),
    (err) => {
      if (err) {
        console.error(err)
        return
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
  const prevMonth = timestamp.getMonth() - 1
  return new Date(timestamp.getFullYear(), prevMonth, 26)
}

main().catch((error) => {
  console.error(error.stack)
  process.exit(1)
})
