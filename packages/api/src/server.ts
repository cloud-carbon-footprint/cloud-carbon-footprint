/*
 * © 2021 Thoughtworks, Inc.
 */

if (process.env.NODE_ENV === 'production') {
  require('module-alias/register')
}

import express from 'express'
import helmet from 'helmet'
import cors, { CorsOptions } from 'cors'

import { createRouter } from './api'
import auth from './auth'
import { Logger } from '@cloud-carbon-footprint/common'

const port = process.env.PORT || 4000
const httpApp = express()
const serverLogger = new Logger('server')

if (process.env.NODE_ENV === 'production') {
  httpApp.use(auth)
}

httpApp.use(helmet())

if (process.env.ENABLE_CORS) {
  const corsOptions: CorsOptions = {
    optionsSuccessStatus: 200,
  }

  if (process.env.CORS_ALLOW_ORIGIN) {
    serverLogger.info(
      'Allowing CORS requests from origin(s) ' + process.env.CORS_ALLOW_ORIGIN,
    )
    corsOptions.origin = process.env.CORS_ALLOW_ORIGIN.split(',')
  }

  httpApp.use(cors(corsOptions))
}

httpApp.use('/api', createRouter())

httpApp.listen(port, () =>
  serverLogger.info(
    `Cloud Carbon Footprint Server listening at http://localhost:${port}`,
  ),
)
