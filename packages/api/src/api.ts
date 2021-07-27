/*
 * © 2021 Thoughtworks, Inc.
 */

import express from 'express'

import {
  App,
  CreateValidFootprintRequest,
  CreateValidRecommendationsRequest,
  FootprintEstimatesRawRequest,
  RecommendationsRawRequest,
} from '@cloud-carbon-footprint/app'

import {
  EstimationRequestValidationError,
  PartialDataError,
  Logger,
  RecommendationsRequestValidationError,
} from '@cloud-carbon-footprint/common'

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

const router = express.Router()

router.get('/footprint', FootprintApiMiddleware)
router.get('/regions/emissions-factors', EmissionsApiMiddleware)
router.get('/recommendations', RecommendationsApiMiddleware)

export default router
