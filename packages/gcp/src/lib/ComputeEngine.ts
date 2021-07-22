/*
 * © 2021 Thoughtworks, Inc.
 */

import { v3 } from '@google-cloud/monitoring'
import { google } from '@google-cloud/monitoring/build/protos/protos'
import Aligner = google.monitoring.v3.Aggregation.Aligner
import Reducer = google.monitoring.v3.Aggregation.Reducer
import Full = google.monitoring.v3.ListTimeSeriesRequest.TimeSeriesView.FULL
import { Logger } from '@cloud-carbon-footprint/common'
import {
  ServiceWithCPUUtilization,
  ComputeUsage,
  Cost,
} from '@cloud-carbon-footprint/core'
import { GCP_CLOUD_CONSTANTS } from '../domain'

export default class ComputeEngine extends ServiceWithCPUUtilization {
  serviceName = 'ComputeEngine'
  computeEngineLogger: Logger

  constructor(private client: v3.MetricServiceClient) {
    super()
    this.computeEngineLogger = new Logger('Compute Engine')
  }

  async getUsage(
    start: Date,
    end: Date,
    region: string,
  ): Promise<ComputeUsage[]> {
    const projectId = (await this.client.getProjectId()).toString()
    const name = this.client.projectPath(projectId)

    const cpuMetricType = 'utilization'
    const vCpuMetricType = 'reserved_cores'

    const CPURequest = this.buildTimeSeriesRequest(
      start,
      end,
      name,
      cpuMetricType,
      Reducer.REDUCE_MEAN,
      region,
    )
    const vCPURequest = this.buildTimeSeriesRequest(
      start,
      end,
      name,
      vCpuMetricType,
      Reducer.REDUCE_SUM,
      region,
    )

    const [cpuUtilizationTimeSeries] = await this.client.listTimeSeries(
      CPURequest,
    )
    const [vCPUTimeSeries] = await this.client.listTimeSeries(vCPURequest)

    const result: ComputeUsage[] = []

    // If vCPU doesn't come back, cannot compute
    // If cpuUtilization only comes back, then use average (create ticket)
    if (cpuUtilizationTimeSeries.length == 0 || vCPUTimeSeries.length == 0) {
      return result
    }

    // Will there every be more than one time series returned that we need to iterate through?
    vCPUTimeSeries[0].points.forEach((point, index) => {
      const measuredCpuUtilization =
        cpuUtilizationTimeSeries[0].points[index]?.value.doubleValue
      const cpuUtilizationAverage = this.getCpuUtilization(
        measuredCpuUtilization,
      )
      result.push({
        cpuUtilizationAverage: cpuUtilizationAverage,
        numberOfvCpus: point.value.doubleValue,
        timestamp: new Date(+point.interval.startTime.seconds * 1000),
        usesAverageCPUConstant: !measuredCpuUtilization,
      })
    })

    return result
  }

  private getCpuUtilization(measuredCpuUtilization: number) {
    return measuredCpuUtilization
      ? measuredCpuUtilization
      : GCP_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020 / 100
  }

  buildTimeSeriesRequest(
    startDate: Date,
    endDate: Date,
    projectName: string,
    metricType: string,
    crossSeriesReducer: Reducer,
    region: string,
  ) {
    const filter = `resource.type = "gce_instance" AND metric.type="compute.googleapis.com/instance/cpu/${metricType}" AND metadata.system_labels.region=${region}`

    return {
      name: projectName,
      filter: filter,
      aggregation: {
        alignmentPeriod: { seconds: 3600 },
        perSeriesAligner: Aligner.ALIGN_MEAN,
        crossSeriesReducer: crossSeriesReducer,
      },
      view: Full,
      interval: {
        startTime: {
          seconds: new Date(startDate).getTime() / 1000,
        },
        endTime: {
          seconds: new Date(endDate).getTime() / 1000,
        },
      },
    }
  }
  /* istanbul ignore next */
  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    this.computeEngineLogger.warn(
      `getCosts not Implemented. Called with start: ${start}, end: ${end}, region: ${region}`,
    )
    return []
  }
}
