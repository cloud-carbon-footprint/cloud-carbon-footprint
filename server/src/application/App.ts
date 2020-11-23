/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { EstimationRequest } from '@application/CreateValidRequest'
import AWSAccount from '@application/AWSAccount'
import configLoader from '@application/ConfigLoader'
import { EstimationResult, reduceByTimestamp } from '@application/EstimationResult'
import cache from '@application/Cache'
import GCPAccount from '@application/GCPAccount'
import FilterResult, { getAccounts } from '@domain/FilterResult'

export default class App {
  @cache()
  async getCostAndEstimates(request: EstimationRequest): Promise<EstimationResult[]> {
    const startDate = request.startDate
    const endDate = request.endDate
    const config = configLoader()
    const AWS = config.AWS
    const GCP = config.GCP

    if (request.region) {
      const estimatesForAccounts: EstimationResult[][] = []
      for (const account of AWS.accounts) {
        const estimates: EstimationResult[] = await Promise.all(
          await new AWSAccount(account.id, account.name, AWS.CURRENT_REGIONS).getDataForRegion(
            request.region,
            startDate,
            endDate,
          ),
        )
        estimatesForAccounts.push(estimates)
      }
      return estimatesForAccounts.flat()
    } else {
      // Resolve AWS Estimates synchronously in order to avoid hitting API limits
      const AWSEstimatesByRegion: EstimationResult[][] = []
      for (const account of AWS.accounts) {
        const estimates: EstimationResult[] = await Promise.all(
          await new AWSAccount(account.id, account.name, AWS.CURRENT_REGIONS).getDataForRegions(startDate, endDate),
        )
        AWSEstimatesByRegion.push(estimates)
      }

      // Resolve GCP Estimates asynchronously
      const GCPEstimatesByRegion = await Promise.all(
        GCP.projects
          .map((project) => {
            return new GCPAccount(project.id, project.name, GCP.CURRENT_REGIONS).getDataForRegions(startDate, endDate)
          })
          .flat(),
      )
      return reduceByTimestamp(AWSEstimatesByRegion.flat().flat().concat(GCPEstimatesByRegion.flat()))
    }
  }

  getFilterData(): FilterResult {
    return { accounts: getAccounts() }
  }
}
