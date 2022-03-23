/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  configLoader,
  EmissionRatioResult,
  EstimationResult,
  GroupBy,
  LookupTableInput,
  LookupTableOutput,
  OnPremiseDataInput,
  OnPremiseDataOutput,
  RecommendationResult,
  reduceByTimestamp,
} from '@cloud-carbon-footprint/common'
import {
  AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
  AzureAccount,
} from '@cloud-carbon-footprint/azure'
import {
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
  AWSAccount,
} from '@cloud-carbon-footprint/aws'
import { getGCPEmissionsFactors, GCPAccount } from '@cloud-carbon-footprint/gcp'
import { OnPremise } from '@cloud-carbon-footprint/on-premise'

import cache from './Cache'
import { EstimationRequest, RecommendationRequest } from './CreateValidRequest'
import { promises as fs } from 'fs'

export const recommendationsMockPath = 'recommendations.mock.json'

export default class App {
  @cache()
  async getCostAndEstimates(
    request: EstimationRequest,
  ): Promise<EstimationResult[]> {
    const startDate = request.startDate
    const endDate = request.endDate
    const grouping =
      (request.groupBy as GroupBy) || configLoader().GROUP_QUERY_RESULTS_BY
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
          ).getDataForRegion(request.region, startDate, endDate, grouping),
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
        ).getDataFromCostAndUsageReports(startDate, endDate, grouping)
        AWSEstimatesByRegion.push(estimates)
      } else {
        // Resolve AWS Estimates synchronously in order to avoid hitting API limits
        for (const account of AWS.accounts) {
          const estimates: EstimationResult[] = await Promise.all(
            await new AWSAccount(
              account.id,
              account.name,
              AWS.CURRENT_REGIONS,
            ).getDataForRegions(startDate, endDate, grouping),
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
        ).getDataFromBillingExportTable(startDate, endDate, grouping)
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
              ).getDataForRegions(startDate, endDate, grouping)
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
          grouping,
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
      GCP: getGCPEmissionsFactors(),
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
    if (process.env.TEST_MODE) {
      const recommendationsMock = await fs.readFile(
        recommendationsMockPath,
        'utf8',
      )
      return JSON.parse(recommendationsMock)
    }
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
    return AWSAccount.getCostAndUsageReportsDataFromInputData(inputData)
  }

  getGcpEstimatesFromInputData(
    inputData: LookupTableInput[],
  ): LookupTableOutput[] {
    return GCPAccount.getBillingExportDataFromInputData(inputData)
  }

  getAzureEstimatesFromInputData(
    inputData: LookupTableInput[],
  ): LookupTableOutput[] {
    return AzureAccount.getDataFromConsumptionManagementInputData(inputData)
  }

  getOnPremiseEstimatesFromInputData(
    inputData: OnPremiseDataInput[],
  ): OnPremiseDataOutput[] {
    return OnPremise.getOnPremiseDataFromInputData(inputData)
  }
}
