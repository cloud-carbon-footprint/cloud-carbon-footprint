import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import ComputeUsage, { buildComputeUsages } from '@domain/ComputeUsage'
import Cost from '@domain/Cost'
import TimeSeriesView, { MetricServiceClient} from '@google-cloud/monitoring'
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
        //one hour alignment
        alignmentPeriod: { seconds: 3600 },
        perSeriesAligner: Aligner.ALIGN_MEAN, //average for the instance, in an hour
        crossSeriesReducer: Reducer.REDUCE_MEAN, //aggregate the mean across instances
      },
      view: Full,
      //Date in UTC, minus one millisecond because the interval is exclusive, not inclusive of the startTime.
      // (This documentation https://cloud.google.com/monitoring/api/ref_v3/rest/v3/TimeInterval
      // says the interval IS inclusive, but based on our experience so far, it isn't.)
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
    
    console.log(cpuUtilizationTimeSeries)
    const rawComputeUsages = [{
      timestamp : new Date(1000 * +cpuUtilizationTimeSeries[0].points[0].interval.startTime.seconds).toString(),
      id : "cpuutilization",
      value : cpuUtilizationTimeSeries[0].points[0].value.doubleValue
    },
    {
      timestamp : new Date(1000 * +vCPUTimeSeries[0].points[0].interval.startTime.seconds).toString(),
      id : "vCPU",
      value : vCPUTimeSeries[0].points[0].value.doubleValue
    }
  ]

    //combine cpuUtilizationTimeSeries and vCPUTimeSeries into RawComputeUsage[]
    console.log('cpuUtilization: ' + cpuUtilizationTimeSeries)
    console.log('vCPU' + vCPUTimeSeries)
    // example of what rawComputeUsages looks like
    // const rawComputeUsages = [{
    //   timestamp: new Date('2020-09-16T23:00:00.000Z'),
    //   id: "cpuutilization",
    //   value: 4
    // }
    // {
    //   timestamp: new Date('2020-09-16T23:00:00.000Z'),
    //   id: "vCPUs",
    //   value: 4
    // }]

    buildComputeUsages(rawComputeUsages, "GCP")
    return []
  }

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    console.log(`getCosts not Implemented. Called with start: ${start}, end: ${end}, region: ${region}`)
    return []
  }
}
