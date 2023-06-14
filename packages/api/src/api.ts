/*
 * © 2021 Thoughtworks, Inc.
 */

import express from 'express'
import { setConfig, CCFConfig } from '@cloud-carbon-footprint/common'
import {
  FootprintApiMiddleware,
  EmissionsApiMiddleware,
  RecommendationsApiMiddleware,
} from './middleware'

export const createRouter = (config?: CCFConfig) => {
  setConfig(config)

  const router = express.Router()
  /**
   * @openapi
   * /api/footprint:
   *  get:
   *     tags:
   *     - Footprint
   *     summary: Get the footprint for the date range
   *     parameters:
   *      - name: start
   *        in: query
   *        description: The start date for the footprint; e.g. 2022-10-18
   *        schema:
   *          type: string
   *        required: true
   *      - name: end
   *        in: query
   *        schema:
   *          type: string
   *        description: The end date for the footprint
   *        required: true
   *      - name: ignoreCache
   *        in: query
   *        schema:
   *          type: boolean
   *          default: false
   *        required: false
   *      - name: groupBy
   *        in: query
   *        schema:
   *          type: string
   *          default: day
   *        required: false
   *      - name: limit
   *        in: query
   *        schema:
   *          type: number
   *          default: 50000
   *        description: The maximum number of estimates to return
   *        required: false
   *      - name: skip
   *        in: query
   *        schema:
   *          type: number
   *          default: 0
   *        description: The number of estimates to skip over
   *        required: false
   *      - name: cloudProviders
   *        in: query
   *        schema:
   *          type: array
   *          items:
   *            type: string
   *        default: []
   *        description: Can be used to filter estimates
   *        required: false
   *      - name: accounts
   *        in: query
   *        schema:
   *          type: array
   *          items:
   *            type: string
   *        default: []
   *        description: Can be used to filter estimates
   *        required: false
   *      - name: services
   *        in: query
   *        schema:
   *          type: array
   *          items:
   *            type: string
   *        default: []
   *        description: Can be used to filter estimates
   *        required: false
   *      - name: regions
   *        in: query
   *        schema:
   *          type: array
   *          items:
   *            type: string
   *        default: []
   *        description: Can be used to filter estimates
   *        required: false
   *      - name: tags
   *        in: query
   *        schema:
   *          type: object
   *          additionalProperties:
   *            type: string
   *        default: {}
   *        description: Can be used to filter estimates
   *        required: false
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *            schema:
   *             $ref: '#/components/schemas/FootprintResponse'
   *       400:
   *         description: Bad request
   */
  router.get('/footprint', FootprintApiMiddleware)

  /**
   * @openapi
   * /api/regions/emissions-factors:
   *  get:
   *     tags:
   *     - Emissions Factors
   *     description: Gives you back the emissions factors for all regions?
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *            schema:
   *             $ref: '#/components/schemas/EmissionResponse'
   */
  router.get('/regions/emissions-factors', EmissionsApiMiddleware)

  /**
   * @openapi
   * /api/recommendations:
   *  get:
   *     tags:
   *     - Recommendations
   *     description: Gives you back recommendations to decrease your cloud carbon footprint
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *            schema:
   *             $ref: '#/components/schemas/RecommendationsResponse'
   */
  router.get('/recommendations', RecommendationsApiMiddleware)

  /**
   * @openapi
   * /api/healthz:
   *  get:
   *     tags:
   *     - Healthcheck
   *     description: Responds if the app is up and running
   *     responses:
   *       200:
   *         description: App is up and running
   */
  router.get('/healthz', (req: express.Request, res: express.Response) => {
    res.status(200).send('OK')
  })

  return router
}
