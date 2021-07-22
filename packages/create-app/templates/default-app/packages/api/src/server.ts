/*
 * © 2021 Thoughtworks, Inc.
 */

if (process.env.NODE_ENV === 'production') {
  require('module-alias/register')
}

import express from 'express'
import helmet from 'helmet'

import api from './api'
import auth from './auth'
import { Logger } from '@cloud-carbon-footprint/common'

const port = process.env.PORT || 4000
const httpApp = express()
const serverLogger = new Logger('server')

if (process.env.NODE_ENV === 'production') {
  httpApp.use(auth)
}

httpApp.use(helmet())

httpApp.use('/api', api)

httpApp.listen(port, () =>
  serverLogger.info(
    `Cloud Carbon Footprint Server listening at http://localhost:${port}`,
  ),
)
