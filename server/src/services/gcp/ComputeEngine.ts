import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import ComputeUsage from '@domain/ComputeUsage'
import Cost from '@domain/Cost'
import { MetricServiceClient } from "@google-cloud/monitoring" 
import {google} from '@google-cloud/monitoring/build/protos/protos'
import Aligner = google.monitoring.v3.Aggregation.Aligner
import Reducer = google.monitoring.v3.Aggregation.Reducer

export default class ComputeEngine extends ServiceWithCPUUtilization {
  serviceName = 'computeEngine'

  constructor() {
    super()
  }

  async getUsage(start: Date, end: Date, region: string): Promise<any[]> {
    let client = new MetricServiceClient();

    const startTime = '2020-09-16T00:59:00.000Z';
    const endTime = '2020-09-17T00:00:00.000Z';
  
    const projectId = 'cloud-carbon-footprint';

    const request = {
      name: client.projectPath(projectId),
      filter: 'resource.type = "gce_instance" AND ' +
        'metric.type="compute.googleapis.com/instance/cpu/utilization" AND ' +
        'metadata.system_labels.region="us-central1"',
      aggregation: {
        //one hour alignment
        alignmentPeriod: {seconds: 3600},
        perSeriesAligner: Aligner.ALIGN_MEAN, //average for the instance, in an hour
        crossSeriesReducer: Reducer.REDUCE_MEAN //aggregate the mean across instances
      },
      interval: {
        startTime: {
          seconds: 1000,
        },
        endTime: {
          seconds: 1000,
        },
      },
    };


    const [timeSeries] = await client.listTimeSeries(request)
    console.log(timeSeries)
    console.log(`getUsage not Implemented. Called with start: ${start}, end: ${end}, region: ${region}`)
    return [timeSeries]
  }

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    console.log(`getCosts not Implemented. Called with start: ${start}, end: ${end}, region: ${region}`)
    return []
  }
}
