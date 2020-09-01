import EstimatorCache from '@application/EstimatorCache'
import { EstimationResult } from '@application/EstimationResult'

export default class EstimatorCacheInMemory implements EstimatorCache {
  getEstimates(): EstimationResult[] {
    throw new Error('Not implemented yet. Consider to implement it. Be a good programmer.')
    return [
      {
        timestamp: new Date('2020-07-10T00:00:00.000Z'),
        serviceEstimates: [
          {
            timestamp: new Date('2020-07-10T00:00:00.000Z'),
            serviceName: 'ebs',
            wattHours: 0.85506240214656,
            co2e: 0.00028809481765817085,
            cost: 0,
            region: 'us-east-1',
          },
          {
            timestamp: new Date('2020-07-10T00:00:00.000Z'),
            serviceName: 's3',
            wattHours: 0.000055192831200000006,
            co2e: 1.859603299207719e-8,
            cost: 0,
            region: 'us-east-1',
          },
          {
            timestamp: new Date('2020-07-10T00:00:00.000Z'),
            serviceName: 'ec2',
            wattHours: 73.07799999999997,
            co2e: 0.024622054521367207,
            cost: 1.8757490568,
            region: 'us-east-1',
          },
        ],
      },
      {
        timestamp: new Date('2020-07-11T00:00:00.000Z'),
        serviceEstimates: [
          {
            timestamp: new Date('2020-07-11T00:00:00.000Z'),
            serviceName: 'ebs',
            wattHours: 0.8446752018270719,
            co2e: 0.00028459507474524494,
            cost: 0,
            region: 'us-east-1',
          },
          {
            timestamp: new Date('2020-07-11T00:00:00.000Z'),
            serviceName: 's3',
            wattHours: 0.000055192831200000006,
            co2e: 1.859603299207719e-8,
            cost: 0,
            region: 'us-east-1',
          },
          {
            timestamp: new Date('2020-07-11T00:00:00.000Z'),
            serviceName: 'ec2',
            wattHours: 73.07799999999997,
            co2e: 0.024622054521367204,
            cost: 1.8411780376,
            region: 'us-east-1',
          },
        ],
      },
    ]
  }

  setEstimates(): void {
    throw new Error('Not implemented yet. Consider to implement it. Be a good programmer.')
  }
}
