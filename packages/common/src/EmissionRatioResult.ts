/*
 * © 2021 Thoughtworks, Inc.
 */

/**
 * @openapi
 * components:
 *  schemas:
 *    EmissionResponse:
 *      type: object
 *      properties:
 *        cloudProvider:
 *          type: string
 *        region:
 *          type: string
 *        mtPerKwHour:
 *          type: number
 *          description: metric ton co2e per kwHour
 */
export type EmissionRatioResult = {
  cloudProvider: string
  region: string
  mtPerKwHour: number
}
