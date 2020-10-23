/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { EstimationRequest } from '@application/CreateValidRequest'
import AWSAccount from '@application/AWSAccount'
import configLoader from '@application/ConfigLoader'
import { EstimationResult, reduceByTimestamp } from '@application/EstimationResult'
import cache from '@application/Cache'
import GCPAccount from '@application/GCPAccount'

export default class App {
  // @cache()
  async getCostAndEstimates(request: EstimationRequest): Promise<EstimationResult[]> {
    const startDate = request.startDate
    const endDate = request.endDate
    const config = configLoader()
    const AWS = config.AWS
    const GCP = config.GCP

    if (request.region) {
      const estimatesForAccounts = await Promise.all(
        AWS.accounts.map((account) => {
          return new AWSAccount(account.id, account.name, AWS.CURRENT_REGIONS).getDataForRegion(
            request.region,
            startDate,
            endDate,
          )
        }),
      )
      return estimatesForAccounts.flat()
    } else {
      const AWSEstimatesByRegion = await Promise.all(
        AWS.accounts
          .map((account) => {
            return new AWSAccount(account.id, account.name, AWS.CURRENT_REGIONS).getDataForRegions(startDate, endDate)
          })
          .flat(),
      )
      const GCPEstimatesByRegion = await Promise.all(
        new GCPAccount(GCP.CURRENT_REGIONS).getDataForRegions(startDate, endDate),
      )
      return reduceByTimestamp(AWSEstimatesByRegion.flat().concat(GCPEstimatesByRegion.flat()))
    }
  }
}
