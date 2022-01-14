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

main().catch((error) => {
  console.error(error.stack)
  process.exit(1)
})
