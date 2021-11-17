/*
 * © 2021 Thoughtworks, Inc.
 */

import * as amqp from 'amqplib/callback_api'
import express from 'express'

import {
  EstimationRequestValidationError,
  Logger,
  PartialDataError,
} from '@cloud-carbon-footprint/common'
import {
  App,
  CreateValidFootprintRequest,
  FootprintEstimatesRawRequest,
} from '@cloud-carbon-footprint/app'

const queueEstimations = async (
  apiLogger: Logger,
  // _req: express.Request,
  // res: express.Response,
): Promise<void> => {
  amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
      const q = 'footprint'
      ch.assertQueue(q, { durable: true })
      console.log(' [*] Waiting for messages in %s.', q)
      ch.consume(
        q,
        function (msg) {
          console.log(' [x] Received %s', msg.content.toString())
          // The connection will close in 10 seconds
          apiLogger.info('Queued footprint service is in progress')
          console.log(' [-] Do some calculationsssss...for 30 seconds')
          // await getFootprint(apiLogger, req)
          fakeGetFootprint()
          ch.ack(msg) // Manually acknowledge message
          console.log(' ✅ FIIINISHED!')
        },
        { noAck: false }, // won't wait for acknowledgement from client after processing
      )
    })
  })
}

const fakeGetFootprint = async () => {
  amqp.connect('amqp://localhost', (_err, conn) => {
    conn.createChannel((_err, ch) => {
      const q = 'footprint-status'
      ch.assertQueue(q, { durable: true }) // durable makes it persist after connection closes

      const msg = 'Finished!'
      ch.sendToQueue(q, Buffer.from(msg), { persistent: true }) // makes the message persist in the queue
      console.log(` [X] Send Status: ${msg}`)
    })

    setTimeout(() => {
      conn.close()
    }, 50000)
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getFootprint = async (
  apiLogger: Logger,
  req: express.Request,
  res: express.Response,
): Promise<void> => {
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

export default queueEstimations
