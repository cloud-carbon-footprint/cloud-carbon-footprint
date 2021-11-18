/*
 * © 2021 Thoughtworks, Inc.
 */

import { App, EstimationRequest } from '@cloud-carbon-footprint/app'

if (process.env.NODE_ENV === 'production') {
  require('module-alias/register')
}

import express, { NextFunction } from 'express'
import helmet from 'helmet'

import api from './api'
import auth from './auth'
import { Logger } from '@cloud-carbon-footprint/common'

const port = process.env.PORT || 4000
const httpApp = express()
const serverLogger = new Logger('server')
import Queue, { JobId, Queue as QueueType } from 'bull'

if (process.env.NODE_ENV === 'production') {
  httpApp.use(auth)
}

httpApp.use(helmet())

let footprintQueue: QueueType
let jobId: JobId
;(async function () {
  footprintQueue = new Queue('footprint-estimates', 'redis://localhost:6379')
  footprintQueue
    .process(async (job, done) => {
      const estimationRequest = job.data
      const footprintApp = new App()
      const estimationResults = await footprintApp.getCostAndEstimates(
        estimationRequest,
      )
      done(null, estimationResults)
    })
    .catch((e) => console.log(`Something went wrong: ${e}`))
  const estimationRequest: EstimationRequest = {
    startDate: new Date('2021-10-10'),
    endDate: new Date(),
    ignoreCache: false,
  }
  const job = await footprintQueue.add(estimationRequest)
  jobId = job.id
})()

function setFootprintQueueDetails(
  req: express.Request,
  res: express.Response,
  next: NextFunction,
) {
  res.locals.footprintQueue = footprintQueue
  res.locals.jobId = jobId
  next()
}

httpApp.use('/api', setFootprintQueueDetails, api)

httpApp.listen(port, () =>
  serverLogger.info(
    `Cloud Carbon Footprint Server listening at http://localhost:${port}`,
  ),
)
