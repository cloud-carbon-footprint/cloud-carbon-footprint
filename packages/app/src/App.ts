/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  configLoader,
  EstimationResult,
  reduceByTimestamp,
  EmissionRatioResult,
  RecommendationResult,
  LookupTableInput,
  LookupTableOutput,
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
import { EstimationRequest, RecommendationRequest } from './CreateValidRequest'

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
          GCP.BILLING_PROJECT_ID,
          GCP.BILLING_PROJECT_NAME,
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
    const CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH = {
      AWS: AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      GCP: GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      AZURE: AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
    }

    return Object.entries(
      CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
    ).reduce((emissionDataResult, entry) => {
      const [cloudProvider, emissionsFactors] = entry
      Object.keys(emissionsFactors).forEach((region) => {
        emissionDataResult.push({
          cloudProvider,
          region,
          mtPerKwHour: emissionsFactors[region],
        })
      })
      return emissionDataResult
    }, [])
  }

  async getRecommendations(
    request: RecommendationRequest,
  ): Promise<RecommendationResult[]> {
    const config = configLoader()
    const AWS = config.AWS
    const GCP = config.GCP
    const recommendations: RecommendationResult[][] = []

    const AWSRecommendations: RecommendationResult[][] = []
    if (AWS.USE_BILLING_DATA) {
      const recommendations = await new AWSAccount(
        AWS.BILLING_ACCOUNT_ID,
        AWS.BILLING_ACCOUNT_NAME,
        [AWS.ATHENA_REGION],
      ).getDataForRecommendations(request.awsRecommendationTarget)
      AWSRecommendations.push(recommendations)
    } else {
      // Resolve AWS Estimates synchronously in order to avoid hitting API limits
      for (const account of AWS.accounts) {
        const recommendations: RecommendationResult[] = await Promise.all(
          await new AWSAccount(
            account.id,
            account.name,
            AWS.CURRENT_REGIONS,
          ).getDataForRecommendations(request.awsRecommendationTarget),
        )
        AWSRecommendations.push(recommendations)
      }
    }
    recommendations.push(AWSRecommendations.flat())

    let GCPRecommendations: RecommendationResult[][] = []
    if (GCP.USE_BILLING_DATA) {
      const recommendations = await new GCPAccount(
        GCP.BILLING_PROJECT_ID,
        GCP.BILLING_PROJECT_NAME,
        [],
      ).getDataForRecommendations()
      GCPRecommendations.push(recommendations)
    } else {
      GCPRecommendations = await Promise.all(
        GCP.projects.map((project) =>
          new GCPAccount(
            project.id,
            project.name,
            GCP.CURRENT_REGIONS,
          ).getDataForRecommendations(),
        ),
      )
    }
    recommendations.push(GCPRecommendations.flat())

    return recommendations.flat()
  }

  getAwsEstimatesFromInputData(
    inputData: LookupTableInput[],
  ): LookupTableOutput[] {
    const config = configLoader()
    const AWS = config.AWS
    return new AWSAccount(AWS.BILLING_ACCOUNT_ID, AWS.BILLING_ACCOUNT_NAME, [
      AWS.ATHENA_REGION,
    ]).getCostAndUsageReportsDataFromInputData(inputData)
  }

  getGcpEstimatesFromInputData(
    inputData: LookupTableInput[],
  ): LookupTableOutput[] {
    const config = configLoader()
    const GCP = config.GCP
    return new GCPAccount(
      GCP.BILLING_PROJECT_ID,
      GCP.BILLING_PROJECT_NAME,
      [],
    ).getBillingExportDataFromInputData(inputData)
  }
}
