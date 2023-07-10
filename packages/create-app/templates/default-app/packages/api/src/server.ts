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
import { Logger, configLoader } from '@cloud-carbon-footprint/common'
import { MongoDbCacheManager } from '@cloud-carbon-footprint/app'
import swaggerDocs from './utils/swagger'
import auth from './utils/auth'

const port = process.env.PORT || 4000
const httpApp = express()
const serverLogger = new Logger('Server')

if (process.env.NODE_ENV === 'production') {
  httpApp.use(auth)
}

httpApp.use(helmet())

// Establish Mongo Connection if cache method selected
if (configLoader()?.CACHE_MODE === 'MONGODB') {
  MongoDbCacheManager.createDbConnection()
}

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

httpApp.listen(port, () => {
  serverLogger.info(
    `Cloud Carbon Footprint Server listening at http://localhost:${port}`,
  )
  swaggerDocs(httpApp, Number(port))
})

// Instructions for graceful shutdown
process.on('SIGINT', async () => {
  if (configLoader()?.CACHE_MODE === 'MONGODB') {
    await MongoDbCacheManager.mongoClient.close()
    serverLogger.info('\nMongoDB connection closed')
  }
  serverLogger.info('Cloud Carbon Footprint Server shutting down...')
  process.exit()
})
