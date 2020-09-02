import express from 'express'
import App from '@application/App'
import { EstimationRequestValidationError } from '@application/EstimationRequest'
import { RawRequest } from '@view/RawRequest'
const httpApp = express()

/**
 * Returns the raw estimates
 *
 * Query params:
 * start - Required, UTC start date in format YYYY-MM-DD
 * end - Required, UTC start date in format YYYY-MM-DD
 */
httpApp.get('/api/footprint', async (req: express.Request, res: express.Response) => {
  const rawRequest: RawRequest = {
    startDate: req.query.start?.toString(),
    endDate: req.query.end?.toString(),
    region: req.query.region?.toString(),
  }

  const footprintApp = new App()
  try {
    const estimationResults = await footprintApp.getCostAndEstimates(rawRequest)
    res.json(estimationResults)
  } catch (e) {
    console.error(e)
    if (e instanceof EstimationRequestValidationError) {
      res.status(400).send(e.message)
    } else res.status(500).send('Internal Server Error')
  }
})

export default httpApp
