/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  configLoader,
  EstimationResult,
  reduceByTimestamp,
  EmissionRatioResult,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import {
  AzureAccount,
  AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '@cloud-carbon-footprint/azure'
import {
  AWSAccount,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '@cloud-carbon-footprint/aws'
import {
  GCPAccount,
  GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '@cloud-carbon-footprint/gcp'

import cache from './Cache'
import { EstimationRequest } from './CreateValidRequest'

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

  getEmissionsFactors(): EmissionRatioResult[] {
    const CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH = Object.assign(
      AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
    )
    return Object.keys(
      CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
    ).reduce((emissionDataResult, key) => {
      emissionDataResult.push({
        region: key,
        mtPerKwHour: CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH[key],
      })
      return emissionDataResult
    }, [])
  }

  async getRecommendations(): Promise<RecommendationResult[]> {
    const config = configLoader()
    const AWS = config.AWS
    const AWSRecommendations: RecommendationResult[][] = []
    if (AWS.USE_BILLING_DATA) {
      const recommendations = await new AWSAccount(
        AWS.BILLING_ACCOUNT_ID,
        AWS.BILLING_ACCOUNT_NAME,
        [AWS.ATHENA_REGION],
      ).getDataForRecommendations()
      AWSRecommendations.push(recommendations)
    } else {
      // Resolve AWS Estimates synchronously in order to avoid hitting API limits
      for (const account of AWS.accounts) {
        const recommendations: RecommendationResult[] = await Promise.all(
          await new AWSAccount(
            account.id,
            account.name,
            AWS.CURRENT_REGIONS,
          ).getDataForRecommendations(),
        )
        AWSRecommendations.push(recommendations)
      }
    }
    return AWSRecommendations.flat().flat()
  }
}
