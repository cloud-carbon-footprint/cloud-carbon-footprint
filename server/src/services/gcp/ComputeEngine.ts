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

    const startTime = '2020-09-16T00:59:00.000Z'
    const endTime = '2020-09-17T00:00:00.000Z'

    const projectId = 'cloud-carbon-footprint'
    const request = {
      name: client.projectPath(projectId),
      filter:
        'resource.type = "gce_instance" AND ' +
        'metric.type="compute.googleapis.com/instance/cpu/utilization" AND ' +
        'metadata.system_labels.region="us-central1"',
      aggregation: {
        alignmentPeriod: { seconds: 3600 },
        perSeriesAligner: Aligner.ALIGN_MEAN,
        crossSeriesReducer: Reducer.REDUCE_MEAN,
      },
      view: Full,
      interval: {
        startTime: {
          seconds: 1000,
        },
        endTime: {
          seconds: 2000,
        },
      },
    }
    const [cpuUtilizationTimeSeries] = await client.listTimeSeries(request)
    const [vCPUTimeSeries] = await client.listTimeSeries(request)

    const result: ComputeUsage[] = []

    //assuming that each returns the same number of points - need to check that this is true
    cpuUtilizationTimeSeries[0].points.forEach((point, index) => {
      result.push({
        cpuUtilizationAverage: point.value.doubleValue,
        numberOfvCpus: vCPUTimeSeries[0].points[index].value.doubleValue,
        timestamp: new Date('2020-09-16T23:00:00.000Z'),
        usesAverageCPUConstant: false, //might not need this, verify whether we'd
        // ever get vcpus for a timestamp and not get cpuutilization. for aws this was happend for terminated instances
      })
    })

    return result
  }

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    console.log(`getCosts not Implemented. Called with start: ${start}, end: ${end}, region: ${region}`)
    return []
  }
}
