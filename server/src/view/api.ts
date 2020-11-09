/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import express from 'express'

import App from '@application/App'
import CreateValidRequest, { EstimationRequestValidationError, PartialDataError } from '@application/CreateValidRequest'
import { RawRequest } from '@view/RawRequest'

import Logger from '@services/Logger'

const apiLogger = new Logger('api')

/**
 * Returns the raw estimates
 *
 * Query params:
 * start - Required, UTC start date in format YYYY-MM-DD
 * end - Required, UTC start date in format YYYY-MM-DD
 */
const FootprintApiMiddleware = async function (req: express.Request, res: express.Response): Promise<void> {
  const rawRequest: RawRequest = {
    startDate: req.query.start?.toString(),
    endDate: req.query.end?.toString(),
  }
  apiLogger.info(
    `Footprint API request started with Start Date: ${rawRequest.startDate} and End Date: ${rawRequest.endDate}`,
  )
  const footprintApp = new App()
  try {
    const estimationRequest = CreateValidRequest(rawRequest)
    const estimationResults = await footprintApp.getCostAndEstimates(estimationRequest)
    res.json(estimationResults)
  } catch (e) {
    apiLogger.error(`Unable to process footprint request.`, e)
    if (e instanceof EstimationRequestValidationError) {
      res.status(400).send(e.message)
    } else if (e instanceof PartialDataError) {
      res.status(416).send(e.message)
    } else res.status(500).send('Internal Server Error')
  }
}

const router = express.Router()

router.get('/footprint', FootprintApiMiddleware)

export default router
