/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import express from 'express'
import helmet from 'helmet'

import App from '@application/App'
import CreateValidRequest, { EstimationRequestValidationError } from '@application/CreateValidRequest'
import { RawRequest } from '@view/RawRequest'

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

  const footprintApp = new App()
  try {
    const estimationRequest = CreateValidRequest(rawRequest)
    const estimationResults = await footprintApp.getCostAndEstimates(estimationRequest)
    res.json(estimationResults)
  } catch (e) {
    console.error(e)
    if (e instanceof EstimationRequestValidationError) {
      res.status(400).send(e.message)
    } else res.status(500).send('Internal Server Error')
  }
}

const router = express.Router()

router.use(helmet())

router.get('/footprint', FootprintApiMiddleware)

export default router
