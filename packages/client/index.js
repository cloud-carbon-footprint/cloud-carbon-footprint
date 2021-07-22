/*
 * © 2021 Thoughtworks, Inc.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const helmet = require('helmet')

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

const port = process.env.PORT || 8080
const app = express()

app.use(helmet())

app.use(express.static('build'))

app.listen(port, () =>
  console.log(
    `Cloud Carbon Footprint Server listening at http://localhost:${port}`,
  ),
)

module.exports = app
