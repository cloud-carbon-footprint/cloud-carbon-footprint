/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  App,
  CreateValidFootprintRequest,
  FootprintEstimatesRawRequest,
} from '@cloud-carbon-footprint/app'

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
import Queue, { Job, Queue as QueueType } from 'bull'

if (process.env.NODE_ENV === 'production') {
  httpApp.use(auth)
}

httpApp.use(helmet())

let footprintQueue: QueueType
let lastJobId: string | number
  // let jobId: JobId
;(async function () {
  footprintQueue = new Queue('footprint-estimates', 'redis://localhost:6379')
  lastJobId = 0
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
  // const estimationRequest: EstimationRequest = {
  //   startDate: new Date('2021-10-10'),
  //   endDate: new Date(),
  //   ignoreCache: false,
  // }
  // const job = await footprintQueue.add(estimationRequest)
  // jobId = job.id
})()

async function setFootprintQueueDetails(
  req: express.Request,
  res: express.Response,
  next: NextFunction,
) {
  try {
    res.locals.footprintQueue = footprintQueue
    let lastJob: Job
    if (lastJobId) {
      lastJob = await footprintQueue.getJob(lastJobId)
    }
    const rawRequest: FootprintEstimatesRawRequest = {
      startDate: req.query.start?.toString(),
      endDate: req.query.end?.toString(),
      ignoreCache: req.query.ignoreCache?.toString(),
    }
    const estimationRequest = CreateValidFootprintRequest(rawRequest)
    console.log('*** Last Start Date ***', lastJob?.data.startDate)
    console.log(
      '*** New Start Date ***',
      estimationRequest.startDate.toISOString(),
    )
    console.log(
      '*** Is same job?  ***',
      lastJob?.data.startDate === estimationRequest.startDate.toISOString(),
    )
    if (lastJob?.data.startDate === estimationRequest.startDate.toISOString()) {
      res.locals.footprintJob = lastJob
    } else {
      await footprintQueue.add(estimationRequest, { delay: 5000 })
      lastJobId = await footprintQueue.getNextJob().then((job) => job?.id)
    }
    res.locals.jobId = lastJobId
  } catch (e) {
    console.log(e.message)
  }

  console.log('*** JOB ID ***', lastJobId)
  /* What does this next function do? How does it work? */
  next()
}

httpApp.use('/api', setFootprintQueueDetails, api)

httpApp.listen(port, () =>
  serverLogger.info(
    `Cloud Carbon Footprint Server listening at http://localhost:${port}`,
  ),
)
