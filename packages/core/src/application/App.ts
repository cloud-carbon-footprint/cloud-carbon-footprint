/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import { EstimationRequest } from './CreateValidRequest'
import AWSAccount from './AWSAccount'
import configLoader from './ConfigLoader'
import { EstimationResult, reduceByTimestamp } from './EstimationResult'
import cache from './Cache'
import GCPAccount from './GCPAccount'
import FilterResult, { getAccounts } from './FilterResult'
import AzureAccount from './AzureAccount'
export default class App {
  @cache()
  async getCostAndEstimates(
    request: EstimationRequest,
  ): Promise<EstimationResult[]> {
    const startDate = request.startDate
    const endDate = request.endDate
    const config = configLoader()
    const AWS = config.AWS
    const GCP = config.GCP
    const AZURE = config.AZURE

    if (request.region) {
      const estimatesForAccounts: EstimationResult[][] = []
      for (const account of AWS.accounts) {
        const estimates: EstimationResult[] = await Promise.all(
          await new AWSAccount(
            account.id,
            account.name,
            AWS.CURRENT_REGIONS,
          ).getDataForRegion(request.region, startDate, endDate),
        )
        estimatesForAccounts.push(estimates)
      }
      return estimatesForAccounts.flat()
    } else {
      const AWSEstimatesByRegion: EstimationResult[][] = []
      if (AWS.USE_BILLING_DATA) {
        const estimates = await new AWSAccount(
          AWS.BILLING_ACCOUNT_ID,
          AWS.BILLING_ACCOUNT_NAME,
          [AWS.ATHENA_REGION],
        ).getDataFromCostAndUsageReports(startDate, endDate)
        AWSEstimatesByRegion.push(estimates)
      } else {
        // Resolve AWS Estimates synchronously in order to avoid hitting API limits
        for (const account of AWS.accounts) {
          const estimates: EstimationResult[] = await Promise.all(
            await new AWSAccount(
              account.id,
              account.name,
              AWS.CURRENT_REGIONS,
            ).getDataForRegions(startDate, endDate),
          )
          AWSEstimatesByRegion.push(estimates)
        }
      }
      let GCPEstimatesByRegion: EstimationResult[][] = []
      if (GCP.USE_BILLING_DATA) {
        const estimates = await new GCPAccount(
          GCP.BILLING_ACCOUNT_ID,
          GCP.BILLING_ACCOUNT_NAME,
          [],
        ).getDataFromBillingExportTable(startDate, endDate)
        GCPEstimatesByRegion.push(estimates)
      } else {
        // Resolve GCP Estimates asynchronously
        GCPEstimatesByRegion = await Promise.all(
          GCP.projects
            .map((project) => {
              return new GCPAccount(
                project.id,
                project.name,
                GCP.CURRENT_REGIONS,
              ).getDataForRegions(startDate, endDate)
            })
            .flat(),
        )
      }
      const AzureEstimatesByRegion: EstimationResult[][] = []
      if (AZURE?.USE_BILLING_DATA) {
        const azureAccount = new AzureAccount()
        await azureAccount.initializeAccount()
        const estimates = await azureAccount.getDataFromConsumptionManagement(
          startDate,
          endDate,
        )
        AzureEstimatesByRegion.push(estimates)
      }

      return reduceByTimestamp(
        AWSEstimatesByRegion.flat()
          .flat()
          .concat(GCPEstimatesByRegion.flat())
          .concat(AzureEstimatesByRegion.flat()),
      )
    }
  }

  getFilterData(): FilterResult {
    return { accounts: getAccounts() }
  }
}
