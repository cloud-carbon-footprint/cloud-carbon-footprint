import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import ComputeUsage from '@domain/ComputeUsage'
import Cost from '@domain/Cost'
import { MetricServiceClient } from '@google-cloud/monitoring'
import { google } from '@google-cloud/monitoring/build/protos/protos'
import Aligner = google.monitoring.v3.Aggregation.Aligner
import Reducer = google.monitoring.v3.Aggregation.Reducer
import Full = google.monitoring.v3.ListTimeSeriesRequest.TimeSeriesView.FULL

export default class ComputeEngine extends ServiceWithCPUUtilization {
  serviceName = 'computeEngine'

  constructor() {
    super()
  }

  async getUsage(start: Date, end: Date, region: string): Promise<ComputeUsage[]> {
    const client = new MetricServiceClient()
    const projectId = 'cloud-carbon-footprint'
    const name = client.projectPath(projectId)
    const cpuMetricType = 'utilization'
    const vCpuMetricType = 'reserved_cores'

    const CPURequest = this.buildTimeSeriesRequest(start, end, name, cpuMetricType, Reducer.REDUCE_MEAN, region)
    const vCPURequest = this.buildTimeSeriesRequest(start, end, name, vCpuMetricType, Reducer.REDUCE_SUM, region)

    const [cpuUtilizationTimeSeries] = await client.listTimeSeries(CPURequest)
    const [vCPUTimeSeries] = await client.listTimeSeries(vCPURequest)

    const result: ComputeUsage[] = []

    cpuUtilizationTimeSeries[0].points.forEach((point, index) => {
      result.push({
        cpuUtilizationAverage: point.value.doubleValue,
        numberOfvCpus: vCPUTimeSeries[0].points[index].value.doubleValue,
        timestamp: new Date(+point.interval.startTime.seconds * 1000),
        usesAverageCPUConstant: false,
      })
    })

    return result
  }

  buildTimeSeriesRequest(
    startDate: Date,
    endDate: Date,
    projectName: string,
    metricType: string,
    crossSeriesReducer: Reducer,
    region: string,
  ) {
    return {
      name: projectName,
      filter: `resource.type = "gce_instance" AND metric.type="compute.googleapis.com/instance/cpu/${metricType}" AND
       metadata.system_labels.region=${region}`,
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

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    console.log(`getCosts not Implemented. Called with start: ${start}, end: ${end}, region: ${region}`)
    return []
  }
}
