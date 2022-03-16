/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import {
  EstimationResult,
  GroupBy,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'

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
  periodStartDate: Date
  periodEndDate: Date
  groupBy: GroupBy
  serviceEstimates: serviceEstimateWithUnknowns[]
}

const testAccountA = 'test-a'
const testAccountB = 'test-b'
const testAccountC = 'test-c'

const dateOne = new Date('2020-07-10T00:00:00.000Z')
const dateOnePeriodEnd = moment(dateOne).add(1, 'd').toDate()
const dateTwo = new Date('2020-07-11T00:00:00.000Z')
const dateTwoPeriodEnd = moment(dateTwo).add(1, 'd').toDate()

const mockData: EstimationResult[] = [
  {
    timestamp: dateOne,
    periodStartDate: dateOne,
    periodEndDate: dateOnePeriodEnd,
    groupBy: GroupBy.day,
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
    timestamp: dateTwo,
    periodStartDate: dateTwo,
    periodEndDate: dateTwoPeriodEnd,
    groupBy: GroupBy.day,
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

const mockDataWithUnknownsAWS: EstimationResultWithUnknowns[] = [
  {
    timestamp: dateOne,
    periodStartDate: dateOne,
    periodEndDate: dateOnePeriodEnd,
    groupBy: GroupBy.day,
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

const mockDataWithUnknownsGCP: EstimationResultWithUnknowns[] = [
  {
    timestamp: dateTwo,
    periodStartDate: dateTwo,
    periodEndDate: dateTwoPeriodEnd,
    groupBy: GroupBy.day,
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
]

const mockDataWithHigherPrecision: EstimationResult[] = [
  {
    timestamp: dateOne,
    periodStartDate: dateOne,
    periodEndDate: dateOnePeriodEnd,
    groupBy: GroupBy.day,
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
    timestamp: dateTwo,
    periodStartDate: dateTwo,
    periodEndDate: dateTwoPeriodEnd,
    groupBy: GroupBy.day,
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

const mockDataWithSmallNumbers: EstimationResult[] = [
  {
    timestamp: dateOne,
    periodStartDate: dateOne,
    periodEndDate: dateOnePeriodEnd,
    groupBy: GroupBy.day,
    serviceEstimates: [
      {
        cloudProvider: 'aws',
        accountId: '1',
        accountName: 'testacct',
        serviceName: 'ebs',
        kilowattHours: 0.0012345,
        co2e: 0.0000012345,
        cost: 0.0012345,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
      {
        cloudProvider: 'aws',
        accountId: '2',
        accountName: 'testacct',
        serviceName: 'ec2',
        kilowattHours: 0.0012345,
        co2e: 0.0000012345,
        cost: 0.0012345,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
    ],
  },
  {
    timestamp: dateTwo,
    periodStartDate: dateTwo,
    periodEndDate: dateTwoPeriodEnd,
    groupBy: GroupBy.day,
    serviceEstimates: [
      {
        cloudProvider: 'aws',
        accountId: '3',
        accountName: 'testacct',
        serviceName: 'ebs',
        kilowattHours: 0.0012345,
        co2e: 0.0000012345,
        cost: 0.0012345,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
      {
        cloudProvider: 'aws',
        accountId: '4',
        accountName: 'testacct',
        serviceName: 'ec2',
        kilowattHours: 0.0012345,
        co2e: 0.0000012345,
        cost: 0.0012345,
        region: 'us-east-1',
        usesAverageCPUConstant: true,
      },
    ],
  },
]

const mockDataWithLargeNumbers: EstimationResult[] = [
  {
    timestamp: dateOne,
    periodStartDate: dateOne,
    periodEndDate: dateOnePeriodEnd,
    groupBy: GroupBy.day,
    serviceEstimates: [
      {
        cloudProvider: 'aws',
        accountId: '1',
        accountName: 'testacct',
        serviceName: 'ebs',
        kilowattHours: 2.5,
        co2e: 200,
        cost: 325.25,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
      {
        cloudProvider: 'aws',
        accountId: '2',
        accountName: 'testacct',
        serviceName: 'ec2',
        kilowattHours: 1.8,
        co2e: 127,
        cost: 203.47,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
    ],
  },
]

const mockRecommendationData: RecommendationResult[] = [
  {
    cloudProvider: 'AWS',
    accountId: testAccountA,
    accountName: testAccountA,
    region: 'us-west-1',
    recommendationType: 'Modify',
    recommendationDetail: 'Test recommendation detail 1',
    costSavings: 200,
    co2eSavings: 2.539,
    kilowattHourSavings: 3.2,
    instanceName: 'test-instance',
    resourceId: 'test-resource-id',
  },
  {
    cloudProvider: 'AWS',
    accountId: testAccountB,
    accountName: testAccountB,
    region: 'us-west-2',
    recommendationType: 'Terminate',
    recommendationDetail: 'Test recommendation detail 2',
    costSavings: 100,
    co2eSavings: 1.24,
    kilowattHourSavings: 6.2,
    instanceName: 'test-instance',
    resourceId: 'test-resource-id',
  },
]

const mockEmissionsAndRecommendations = {
  emissions: mockData[0].serviceEstimates,
  recommendations: mockRecommendationData,
}

const mockRecommendationDataWithUnknowns: RecommendationResult[] = [
  {
    cloudProvider: 'AWS',
    accountId: testAccountA,
    accountName: null,
    region: null,
    recommendationType: null,
    recommendationDetail: 'Test recommendation detail 1',
    costSavings: 200,
    co2eSavings: 2.539,
    kilowattHourSavings: 3.2,
    instanceName: 'test-instance',
    resourceId: 'test-resource-id',
  },
]

const mockEmissionsAndRecommendationsWithUnknowns = {
  emissions: mockDataWithUnknownsAWS[0].serviceEstimates.concat(
    mockDataWithUnknownsGCP[0].serviceEstimates,
  ),
  recommendations: mockRecommendationDataWithUnknowns,
}

export {
  mockData,
  mockDataWithUnknownsAWS,
  mockDataWithUnknownsGCP,
  mockDataWithHigherPrecision,
  mockDataWithSmallNumbers,
  mockDataWithLargeNumbers,
  mockRecommendationData,
  mockRecommendationDataWithUnknowns,
  mockEmissionsAndRecommendations,
  mockEmissionsAndRecommendationsWithUnknowns,
}
