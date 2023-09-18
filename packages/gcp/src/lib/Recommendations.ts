/*
 * © 2021 Thoughtworks, Inc.
 */

import R from 'ramda'
import { google as googleRecommender } from '@google-cloud/recommender/build/protos/protos'
import { protos as googleCompute } from '@google-cloud/compute'
import IRecommendation = googleRecommender.cloud.recommender.v1.IRecommendation
import IImpact = googleRecommender.cloud.recommender.v1.IImpact
import Instance = googleCompute.google.cloud.compute.v1.IInstance
import Disk = googleCompute.google.cloud.compute.v1.IDisk
import {
  COMPUTE_PROCESSOR_TYPES,
  ComputeEstimator,
  FootprintEstimate,
  ICloudRecommendationsService,
  StorageEstimator,
  StorageUsage,
  KilowattHourTotals,
  CloudConstantsEmissionsFactors,
} from '@cloud-carbon-footprint/core'
import {
  convertBytesToGigabytes,
  getEmissionsFactors,
  getHoursInMonth,
  Logger,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import { GCP_CLOUD_CONSTANTS, getGCPEmissionsFactors } from '../domain'
import {
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  SHARED_CORE_PROCESSORS_BASELINE_UTILIZATION,
} from './MachineTypes'
import {
  ActiveProject,
  RECOMMENDATION_TYPES,
  ResourceDetails,
  UnknownRecommendationDetails,
} from './RecommendationsTypes'
import ServiceWrapper from './ServiceWrapper'
import {
  GCP_MAPPED_REGIONS_TO_ELECTRICITY_MAPS_ZONES,
  GCP_REGIONS,
} from './GCPRegions'

export default class Recommendations implements ICloudRecommendationsService {
  readonly RECOMMENDER_IDS: string[] = [
    // 'google.accounts.security.SecurityKeyRecommender',
    // 'google.compute.commitment.UsageCommitmentRecommender',
    // 'google.iam.policy.Recommender',
    // 'google.cloudsql.instance.OutOfDiskRecommender'
    'google.compute.image.IdleResourceRecommender',
    'google.compute.address.IdleResourceRecommender',
    'google.compute.disk.IdleResourceRecommender',
    'google.compute.instance.IdleResourceRecommender',
    'google.compute.instance.MachineTypeRecommender',
    'google.compute.instanceGroupManager.MachineTypeRecommender',
    'google.logging.productSuggestion.ContainerRecommender',
    'google.monitoring.productSuggestion.ComputeRecommender',
  ]
  private readonly primaryImpactPerformance = 'PERFORMANCE'
  private readonly recommendationsLogger: Logger
  private readonly costAndCo2eTotals: KilowattHourTotals
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly googleServiceWrapper: ServiceWrapper,
  ) {
    this.recommendationsLogger = new Logger('GCPRecommendations')
    this.costAndCo2eTotals = {
      cost: 0,
      kilowattHours: 0,
    }
  }

  async getRecommendations(): Promise<RecommendationResult[]> {
    const activeProjectsAndZones =
      await this.googleServiceWrapper.getActiveProjectsAndZones()
    return await this.getRecommendationsForProjects(activeProjectsAndZones)
  }

  private async getRecommendationsForProjects(
    projects: ActiveProject[],
  ): Promise<RecommendationResult[]> {
    return R.flatten(
      await Promise.all(
        projects.map(async (project: ActiveProject) => {
          return await this.getFilteredRecommendations(project)
        }),
      ),
    )
  }

  private async getFilteredRecommendations(
    project: ActiveProject,
  ): Promise<RecommendationResult[]> {
    const recommendationsByIds = await Promise.all(
      project.zones.map(async (zone) => {
        return await this.googleServiceWrapper.getRecommendationsForRecommenderIds(
          project.id,
          zone,
          this.RECOMMENDER_IDS,
        )
      }),
    )
    const nonEmptyRecommendations = recommendationsByIds
      .flat()
      .filter((recommendationId) => recommendationId.recommendations.length > 0)
    const unknownRecommendations: UnknownRecommendationDetails[] = []
    if (nonEmptyRecommendations.length > 0) {
      const recommendationsResult: RecommendationResult[] = []
      await Promise.all(
        R.flatten(
          nonEmptyRecommendations.map(({ zone, recommendations }) =>
            recommendations.map(async (rec: IRecommendation) => {
              const [estimatedCO2eSavings, resourceDetails] =
                await this.getEstimatedCO2eSavings(project.id, zone, rec)

              const cost = this.getEstimatedCostSavings(rec)
              if (
                rec.recommenderSubtype === RECOMMENDATION_TYPES.DELETE_ADDRESS
              ) {
                unknownRecommendations.push({
                  rec,
                  zone,
                  cost,
                  resourceDetails,
                })
                return
              } else {
                this.accumulateCostAndCo2e(
                  cost,
                  estimatedCO2eSavings.kilowattHours,
                )
                recommendationsResult.push({
                  cloudProvider: 'GCP',
                  accountId: project.id,
                  accountName: project.name,
                  region: this.parseRegionFromZone(zone),
                  recommendationType: rec.recommenderSubtype,
                  recommendationDetail: rec.description,
                  costSavings: cost,
                  co2eSavings: estimatedCO2eSavings.co2e,
                  kilowattHourSavings: estimatedCO2eSavings.kilowattHours,
                  resourceId: resourceDetails.resourceId,
                  instanceName: resourceDetails.resourceName,
                })
              }
            }),
          ),
        ),
      )

      for (let i = 0; i < unknownRecommendations.length; i++) {
        const { rec, zone, cost, resourceDetails } = unknownRecommendations[i]
        const { co2e, kilowattHours } =
          await this.getCo2eEstimationsForUnknowns(zone, cost)

        recommendationsResult.push({
          cloudProvider: 'GCP',
          accountId: project.id,
          accountName: project.name,
          region: this.parseRegionFromZone(zone),
          recommendationType: rec.recommenderSubtype,
          recommendationDetail: rec.description,
          costSavings: cost,
          co2eSavings: co2e,
          kilowattHourSavings: kilowattHours,
          resourceId: resourceDetails.resourceId,
          instanceName: resourceDetails.resourceName,
        })
      }
      return recommendationsResult
    }
    return []
  }

  private async getCo2eEstimationsForUnknowns(
    zone: string,
    cost: number,
  ): Promise<{
    [key: string]: number
  }> {
    if (this.costAndCo2eTotals.cost === 0)
      return {
        co2e: 0,
        kilowattHours: 0,
      }
    const region = this.parseRegionFromZone(zone)
    const emissionsFactors: CloudConstantsEmissionsFactors =
      await this.getEmissionsFactors(region, this.recommendationsLogger)
    const kilowattHoursPerCost =
      this.costAndCo2eTotals.kilowattHours / this.costAndCo2eTotals.cost
    const kilowattHours = cost * kilowattHoursPerCost
    const co2e =
      kilowattHours * emissionsFactors[this.parseRegionFromZone(zone)]
    return { co2e, kilowattHours }
  }

  private accumulateCostAndCo2e(cost: number, kilowattHours: number) {
    this.costAndCo2eTotals.cost += cost
    this.costAndCo2eTotals.kilowattHours += kilowattHours
  }

  private async getEstimatedCO2eSavings(
    projectId: string,
    zone: string,
    recommendation: IRecommendation,
  ): Promise<[FootprintEstimate, ResourceDetails]> {
    let footprintEstimate: FootprintEstimate = {
      timestamp: undefined,
      kilowattHours: 0,
      co2e: 0,
    }
    let resourceDetails: ResourceDetails = {
      resourceId: '',
      resourceName:
        recommendation.content.operationGroups[0].operations[0].resource
          .split('/')
          .pop(),
    }
    let diskDetails: Disk
    try {
      switch (recommendation.recommenderSubtype) {
        case RECOMMENDATION_TYPES.STOP_VM:
          const instanceDetails = await this.getInstanceDetails(
            recommendation,
            projectId,
            zone,
          )
          const computeCO2eEstimatedSavings =
            await this.getCO2EstimatedSavingsForInstance(
              projectId,
              instanceDetails,
              zone,
            )

          const storageFootprintEstimates = await Promise.all(
            instanceDetails.disks.map(async (disk) => {
              diskDetails = await this.googleServiceWrapper.getDiskDetails(
                projectId,
                disk.source.split('disks/').pop(),
                zone,
              )
              return await this.getCO2EstimatesSavingsForDisk(diskDetails, zone)
            }),
          )
          const storageKilowattHoursSavings = R.sum(
            storageFootprintEstimates.map((estimate) => estimate.kilowattHours),
          )
          const storageCo2eSavings = R.sum(
            storageFootprintEstimates.map((estimate) => estimate.co2e),
          )
          footprintEstimate = {
            co2e: computeCO2eEstimatedSavings.co2e + storageCo2eSavings,
            kilowattHours:
              computeCO2eEstimatedSavings.kilowattHours +
              storageKilowattHoursSavings,
            timestamp: undefined,
          }
          resourceDetails = {
            resourceId: instanceDetails.id.toString(),
            resourceName: instanceDetails.name,
          }
          return [footprintEstimate, resourceDetails]
        case RECOMMENDATION_TYPES.CHANGE_MACHINE_TYPE:
          const currentMachineType = recommendation.description
            .replace('.', '')
            .split(' ')[7]
          const currentComputeCO2e =
            await this.getCO2EstimatedSavingsForMachineType(
              projectId,
              zone,
              currentMachineType,
            )

          const newMachineType = recommendation.description
            .replace('.', '')
            .split(' ')[9]
          const newComputeCO2e =
            await this.getCO2EstimatedSavingsForMachineType(
              projectId,
              zone,
              newMachineType,
            )

          footprintEstimate = {
            co2e: currentComputeCO2e.co2e - newComputeCO2e.co2e,
            kilowattHours:
              currentComputeCO2e.kilowattHours - newComputeCO2e.kilowattHours,
            timestamp: undefined,
          }

          const currentMachineInstanceDetails = await this.getInstanceDetails(
            recommendation,
            projectId,
            zone,
          )
          resourceDetails = {
            resourceId: currentMachineInstanceDetails.id.toString(),
            resourceName: currentMachineInstanceDetails.name,
          }
          return [footprintEstimate, resourceDetails]
        case RECOMMENDATION_TYPES.SNAPSHOT_AND_DELETE_DISK:
        case RECOMMENDATION_TYPES.DELETE_DISK:
          diskDetails = await this.googleServiceWrapper.getDiskDetails(
            projectId,
            recommendation.description.split("'")[1],
            zone,
          )

          footprintEstimate = await this.getCO2EstimatesSavingsForDisk(
            diskDetails,
            zone,
          )

          resourceDetails = {
            resourceId: diskDetails.id.toString(),
            resourceName: diskDetails.name,
          }
          return [footprintEstimate, resourceDetails]
        case RECOMMENDATION_TYPES.DELETE_IMAGE:
          const imageId = recommendation.description.split("'")[1]
          const imageDetails = await this.googleServiceWrapper.getImageDetails(
            projectId,
            imageId,
          )
          const imageArchiveSizeGigabytes = convertBytesToGigabytes(
            parseFloat(imageDetails.archiveSizeBytes.toString()),
          )
          footprintEstimate = await this.estimateStorageCO2eSavings(
            imageArchiveSizeGigabytes,
            this.parseRegionFromZone(zone),
          )
          resourceDetails = {
            resourceId: imageDetails.id.toString(),
            resourceName: imageDetails.name,
          }
          return [footprintEstimate, resourceDetails]
        case RECOMMENDATION_TYPES.DELETE_ADDRESS:
          const addressId = recommendation.description.split("'")[1]
          const addressDetails =
            await this.googleServiceWrapper.getAddressDetails(
              projectId,
              addressId,
              zone,
            )
          resourceDetails = {
            resourceId: addressDetails.id.toString(),
            resourceName: addressDetails.name,
          }

          return [footprintEstimate, resourceDetails]
        default:
          this.recommendationsLogger.warn(
            `Unknown/unsupported Recommender Type: ${recommendation.recommenderSubtype}`,
          )
          return [footprintEstimate, resourceDetails]
      }
    } catch (err) {
      this.recommendationsLogger.warn(
        `There was an error in estimating CO2e Savings and getting Resource ID/Name: ${recommendation.name}. Error: ${err.message}.`,
      )
      return [footprintEstimate, resourceDetails]
    }
  }

  private async getCO2EstimatedSavingsForMachineType(
    projectId: string,
    zone: string,
    currentMachineType: string,
  ) {
    const currentMachineTypeDetails =
      await this.googleServiceWrapper.getMachineTypeDetails(
        projectId,
        currentMachineType,
        zone,
      )
    const currentMachineTypeVCPus = Object.keys(
      SHARED_CORE_PROCESSORS_BASELINE_UTILIZATION,
    ).includes(currentMachineType)
      ? SHARED_CORE_PROCESSORS_BASELINE_UTILIZATION[currentMachineType] /
        GCP_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020
      : currentMachineTypeDetails.guestCpus
    return await this.estimateComputeCO2eSavings(
      currentMachineType.split('-')[0],
      currentMachineTypeVCPus,
      this.parseRegionFromZone(zone),
    )
  }

  private async getCO2EstimatesSavingsForDisk(diskDetails: Disk, zone: string) {
    const storageType = this.googleServiceWrapper.getStorageTypeFromDiskName(
      diskDetails.type.split('/').pop(),
    )
    return await this.estimateStorageCO2eSavings(
      parseFloat(diskDetails.sizeGb.toString()),
      this.parseRegionFromZone(zone),
      storageType,
    )
  }

  private async getCO2EstimatedSavingsForInstance(
    projectId: string,
    instanceDetails: Instance,
    zone: string,
  ) {
    const machineType = instanceDetails.machineType.split('/').pop()
    const machineTypeDetails =
      await this.googleServiceWrapper.getMachineTypeDetails(
        projectId,
        machineType,
        zone,
      )

    return await this.estimateComputeCO2eSavings(
      machineType.split('-')[0],
      machineTypeDetails.guestCpus,
      this.parseRegionFromZone(zone),
    )
  }

  private async getInstanceDetails(
    recommendation: IRecommendation,
    projectId: string,
    zone: string,
  ) {
    //recommendation.description.split("'")[1]
    const instanceId =
      recommendation.content.operationGroups[0].operations[0].resource
        .split('/')
        .pop()
    return await this.googleServiceWrapper.getInstanceDetails(
      projectId,
      instanceId,
      zone,
    )
  }

  private async estimateComputeCO2eSavings(
    machineTypeFamily: string,
    vCpus: number,
    region: string,
  ): Promise<FootprintEstimate> {
    const vCpuHours = vCpus * getHoursInMonth()

    const computeUsage = {
      cpuUtilizationAverage: GCP_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      vCpuHours: vCpuHours,
      usesAverageCPUConstant: true,
    }

    const computeProcessors = INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[
      machineTypeFamily
    ] || [COMPUTE_PROCESSOR_TYPES.UNKNOWN]

    const computeConstants = {
      minWatts: GCP_CLOUD_CONSTANTS.getMinWatts(computeProcessors),
      maxWatts: GCP_CLOUD_CONSTANTS.getMaxWatts(computeProcessors),
      powerUsageEffectiveness: GCP_CLOUD_CONSTANTS.getPUE(region),
    }

    const emissionsFactors: CloudConstantsEmissionsFactors =
      await this.getEmissionsFactors(region, this.recommendationsLogger)

    return this.computeEstimator.estimate(
      [computeUsage],
      region,
      emissionsFactors,
      computeConstants,
    )[0]
  }

  private async estimateStorageCO2eSavings(
    storageGigabytes: number,
    region: string,
    storageType?: string,
  ): Promise<FootprintEstimate> {
    const storageUsage: StorageUsage = {
      terabyteHours: (getHoursInMonth() * storageGigabytes) / 1000,
    }
    const storageConstants = {
      powerUsageEffectiveness: GCP_CLOUD_CONSTANTS.getPUE(region),
    }

    const emissionsFactors: CloudConstantsEmissionsFactors =
      await this.getEmissionsFactors(region, this.recommendationsLogger)

    const storageEstimator =
      storageType === 'SSD'
        ? this.ssdStorageEstimator
        : this.hddStorageEstimator

    return {
      usesAverageCPUConstant: false,
      ...storageEstimator.estimate(
        [storageUsage],
        region,
        emissionsFactors,
        storageConstants,
      )[0],
    }
  }

  /* Refer to GCP Documentation for explanation of Money object:
   * https://cloud.google.com/recommender/docs/reference/rest/Shared.Types/Money
   */
  private getEstimatedCostSavings(rec: IRecommendation): number {
    let impact: IImpact = rec.primaryImpact
    if (rec.primaryImpact.category === this.primaryImpactPerformance) {
      impact = rec.additionalImpact[0]
    }
    return Math.abs(
      (parseInt(<string>impact.costProjection.cost.units) +
        impact.costProjection.cost.nanos / 1000000000) *
        -1,
    )
  }

  private parseRegionFromZone(zone: string): string {
    const zoneArray = zone.split('-')
    return zone === 'global'
      ? GCP_REGIONS.UNKNOWN
      : `${zoneArray[0]}-${zoneArray[1]}`
  }

  private async getEmissionsFactors(
    region: string,
    logger: Logger,
  ): Promise<CloudConstantsEmissionsFactors> {
    return await getEmissionsFactors(
      region,
      new Date().toISOString(),
      getGCPEmissionsFactors(),
      GCP_MAPPED_REGIONS_TO_ELECTRICITY_MAPS_ZONES,
      logger,
    )
  }
}
