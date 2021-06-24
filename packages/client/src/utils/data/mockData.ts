/*
 * © 2021 ThoughtWorks, Inc.
 */

import { EstimationResult } from '@cloud-carbon-footprint/common'

interface serviceEstimateWithUnknowns {
  cloudProvider: string
  accountId: string | null
  accountName: string | null
  serviceName: string | null
  kilowattHours: number
  co2e: number
  cost: number
  region: string
  usesAverageCPUConstant?: boolean
}

interface EstimationResultWithUnknowns {
  timestamp: Date
  serviceEstimates: serviceEstimateWithUnknowns[]
}

const testAccountA = 'test-a'
const testAccountB = 'test-b'
const testAccountC = 'test-c'

const date1 = new Date('2020-07-10T00:00:00.000Z')
const date2 = new Date('2020-07-11T00:00:00.000Z')

const mockData: EstimationResult[] = [
  {
    timestamp: date1,
    serviceEstimates: [
      {
        serviceName: 'ebs',
        kilowattHours: 12,
        co2e: 15,
        cost: 5,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
        cloudProvider: 'AWS',
        accountId: testAccountA,
        accountName: testAccountA,
      },
      {
        serviceName: 'ec2',
        kilowattHours: 4,
        co2e: 5,
        cost: 4,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
        cloudProvider: 'GCP',
        accountId: testAccountB,
        accountName: testAccountB,
      },
    ],
  },
  {
    timestamp: date2,
    serviceEstimates: [
      {
        serviceName: 'ebs',
        kilowattHours: 25,
        co2e: 3,
        cost: 6,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
        cloudProvider: 'AWS',
        accountId: testAccountA,
        accountName: testAccountA,
      },
      {
        serviceName: 'ec2',
        kilowattHours: 2,
        co2e: 7,
        cost: 6,
        region: 'us-east-1',
        usesAverageCPUConstant: true,
        cloudProvider: 'AWS',
        accountId: testAccountC,
        accountName: testAccountC,
      },
    ],
  },
]

const mockDataWithUnknowns: EstimationResultWithUnknowns[] = [
  {
    timestamp: date1,
    serviceEstimates: [
      {
        serviceName: null,
        kilowattHours: 5,
        co2e: 6,
        cost: 7,
        region: 'unknown',
        usesAverageCPUConstant: true,
        cloudProvider: 'AWS',
        accountId: testAccountA,
        accountName: testAccountA,
      },
      {
        serviceName: 'ebs',
        kilowattHours: 7,
        co2e: 6,
        cost: 5,
        region: 'us-east-1',
        usesAverageCPUConstant: true,
        cloudProvider: 'GCP',
        accountId: null,
        accountName: null,
      },
    ],
  },
  {
    timestamp: date2,
    serviceEstimates: [
      {
        serviceName: null,
        kilowattHours: 5,
        co2e: 6,
        cost: 7,
        region: 'unknown',
        usesAverageCPUConstant: true,
        cloudProvider: 'GCP',
        accountId: testAccountB,
        accountName: testAccountB,
      },
      {
        serviceName: 'ec2',
        kilowattHours: 7,
        co2e: 6,
        cost: 5,
        region: 'us-east-1',
        usesAverageCPUConstant: true,
        cloudProvider: 'AWS',
        accountId: null,
        accountName: null,
      },
    ],
  },
]

const mockDataWithHigherPrecision: EstimationResult[] = [
  {
    timestamp: date1,
    serviceEstimates: [
      {
        cloudProvider: 'aws',
        accountId: '1',
        accountName: 'testacct',
        serviceName: 'ebs',
        kilowattHours: 12.2342,
        co2e: 15.12341,
        cost: 5.82572,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
      {
        cloudProvider: 'aws',
        accountId: '2',
        accountName: 'testacct',
        serviceName: 'ec2',
        kilowattHours: 4.745634,
        co2e: 5.234236,
        cost: 4.732,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
    ],
  },
  {
    timestamp: date2,
    serviceEstimates: [
      {
        cloudProvider: 'aws',
        accountId: '3',
        accountName: 'testacct',
        serviceName: 'ebs',
        kilowattHours: 25.73446,
        co2e: 3.2600234,
        cost: 6.05931,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
      {
        cloudProvider: 'aws',
        accountId: '4',
        accountName: 'testacct',
        serviceName: 'ec2',
        kilowattHours: 2.4523452,
        co2e: 7.7536,
        cost: 6.2323,
        region: 'us-east-1',
        usesAverageCPUConstant: true,
      },
    ],
  },
]

export { mockData, mockDataWithUnknowns, mockDataWithHigherPrecision }
