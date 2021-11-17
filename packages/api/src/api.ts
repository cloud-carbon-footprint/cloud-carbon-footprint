/*
 * © 2021 Thoughtworks, Inc.
 */

import express from 'express'
import * as amqp from 'amqplib/callback_api'

import {
  App,
  CreateValidFootprintRequest,
  CreateValidRecommendationsRequest,
  FootprintEstimatesRawRequest,
  RecommendationsRawRequest,
} from '@cloud-carbon-footprint/app'

import {
  EstimationRequestValidationError,
  Logger,
  PartialDataError,
  RecommendationsRequestValidationError,
} from '@cloud-carbon-footprint/common'
import queueEstimations from './worker'

const apiLogger = new Logger('api')

/**
 * Returns the raw estimates
 *
 * Query params:
 * start - Required, UTC start date in format YYYY-MM-DD
 * end - Required, UTC start date in format YYYY-MM-DD
 */
const FootprintApiMiddleware = async function (
  req: express.Request,
  res: express.Response,
): Promise<void> {
  // Set the request time out to 10 minutes to allow the request enough time to complete.
  req.socket.setTimeout(1000 * 60 * 10)
  const rawRequest: FootprintEstimatesRawRequest = {
    startDate: req.query.start?.toString(),
    endDate: req.query.end?.toString(),
    ignoreCache: req.query.ignoreCache?.toString(),
  }
  apiLogger.info(
    `Footprint API request started with Start Date: ${rawRequest.startDate} and End Date: ${rawRequest.endDate}`,
  )
  const footprintApp = new App()
  try {
    const estimationRequest = CreateValidFootprintRequest(rawRequest)
    const estimationResults = await footprintApp.getCostAndEstimates(
      estimationRequest,
    )
    res.json(estimationResults)
  } catch (e) {
    apiLogger.error(`Unable to process footprint request.`, e)
    if (
      e.constructor.name ===
      EstimationRequestValidationError.prototype.constructor.name
    ) {
      res.status(400).send(e.message)
    } else if (
      e.constructor.name === PartialDataError.prototype.constructor.name
    ) {
      res.status(416).send(e.message)
    } else res.status(500).send('Internal Server Error')
  }
}

const EmissionsApiMiddleware = async function (
  req: express.Request,
  res: express.Response,
): Promise<void> {
  apiLogger.info(`Regions emissions factors API request started`)
  const footprintApp = new App()
  try {
    const emissionsResults = await footprintApp.getEmissionsFactors()
    res.json(emissionsResults)
  } catch (e) {
    apiLogger.error(`Unable to process regions emissions factors request.`, e)
    res.status(500).send('Internal Server Error')
  }
}

const RecommendationsApiMiddleware = async function (
  req: express.Request,
  res: express.Response,
): Promise<void> {
  const rawRequest: RecommendationsRawRequest = {
    awsRecommendationTarget: req.query.awsRecommendationTarget?.toString(),
  }
  apiLogger.info(`Recommendations API request started`)
  const footprintApp = new App()
  try {
    const estimationRequest = CreateValidRecommendationsRequest(rawRequest)
    const recommendations = await footprintApp.getRecommendations(
      estimationRequest,
    )
    res.json(recommendations)
  } catch (e) {
    apiLogger.error(`Unable to process recommendations request.`, e)
    if (
      e.constructor.name ===
      RecommendationsRequestValidationError.prototype.constructor.name
    ) {
      res.status(400).send(e.message)
    } else {
      res.status(500).send('Internal Server Error')
    }
  }
}

const QueueApiMiddleWare = async function (
  req: express.Request,
  res: express.Response,
): Promise<void> {
  amqp.connect('amqp://localhost', (_err, conn) => {
    conn.createChannel((_err, ch) => {
      const q = 'footprint'
      ch.assertQueue(q, { durable: true }) // durable makes it persist after connection closes

      const msg = 'Start Footprint'
      ch.sendToQueue(q, Buffer.from(msg), { persistent: true }) // makes the message persist in the queue
      console.log(` [X] Send ${msg}`)
    })

    setTimeout(() => {
      conn.close()
    }, 50000)
  })

  setTimeout(() => {
    queueEstimations(apiLogger)
  }, 10000)
  res.status(202).send('The footprint request is being processed!')
}

const FootprintStatusApiMiddleware = async function (
  req: express.Request,
  res: express.Response,
) {
  let statusMessage
  amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
      const q = 'footprint-status'
      ch.assertQueue(q, { durable: true })
      console.log(' [*] Checking for status message in %s.', q)
      ch.consume(
        q,
        function (msg) {
          console.log(' [x] Received %s', msg.content.toString())
          statusMessage = msg.content.toString()
          ch.ack(msg) // Manually acknowledge message
        },
        { noAck: false }, // won't wait for acknowledgement from client after processing
      )
    })
  })
  res.status(200).send(statusMessage)
}

const router = express.Router()

router.get('/footprint', FootprintApiMiddleware)
router.get('/regions/emissions-factors', EmissionsApiMiddleware)
router.get('/recommendations', RecommendationsApiMiddleware)
router.get('/healthz', (req: express.Request, res: express.Response) => {
  res.status(200).send('OK')
})
router.get('/queue-footprint', QueueApiMiddleWare)
router.get('/status-footprint', FootprintStatusApiMiddleware)
export default router
