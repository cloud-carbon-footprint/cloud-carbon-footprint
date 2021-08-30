/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import {
  EstimationResult,
  ServiceData,
  EmissionRatioResult,
} from '@cloud-carbon-footprint/common'

const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * Math.floor(max))
}

const getRandomNumberInRange = (minValue: number, maxValue: number): number => {
  return Math.max(Math.random() * maxValue, minValue + Math.random())
}

const fakeServiceMap: () => { [key: string]: ServiceData } = () => {
  const accountIds = Array.from(Array(6).keys()).map(() => getRandomInt(5))
  return {
    ebs: {
      cloudProvider: 'AWS',
      accountId: `aws account ${accountIds[0]}`,
      accountName: `aws account ${accountIds[0]}`,
      serviceName: 'ebs',
      kilowattHours: Math.random(),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-1',
      usesAverageCPUConstant: false,
    },
    s3: {
      cloudProvider: 'AWS',
      accountId: `aws account ${accountIds[1]}`,
      accountName: `aws account ${accountIds[1]}`,
      serviceName: 's3',
      kilowattHours: Math.random() / 1000,
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-2',
      usesAverageCPUConstant: false,
    },
    ec2: {
      cloudProvider: 'AWS',
      accountId: `aws account ${accountIds[2]}`,
      accountName: `aws account ${accountIds[2]}`,
      serviceName: 'ec2',
      kilowattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-west-1',
      usesAverageCPUConstant: false,
    },
    rds: {
      cloudProvider: 'AWS',
      accountId: `aws account ${accountIds[3]}`,
      accountName: `aws account ${accountIds[3]}`,
      serviceName: 'rds',
      kilowattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-west-2',
      usesAverageCPUConstant: false,
    },
    lambda: {
      cloudProvider: 'AWS',
      accountId: `aws account ${accountIds[4]}`,
      accountName: `aws account ${accountIds[4]}`,
      serviceName: 'lambda',
      kilowattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-1',
      usesAverageCPUConstant: false,
    },
    elasticache: {
      cloudProvider: 'AWS',
      accountId: `gcp account ${accountIds[5]}`,
      accountName: `gcp account ${accountIds[5]}`,
      serviceName: 'elasticache',
      kilowattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-1',
      usesAverageCPUConstant: false,
    },
    computeEngine: {
      cloudProvider: 'GCP',
      accountId: `gcp account ${getRandomInt(5)} id`,
      accountName: `gcp account ${getRandomInt(5)}`,
      serviceName: 'computeEngine',
      kilowattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east1',
      usesAverageCPUConstant: false,
    },
    virtualMachines: {
      cloudProvider: 'AZURE',
      accountId: `azure account ${getRandomInt(5)} id`,
      accountName: `azure account ${getRandomInt(5)}`,
      serviceName: 'virtualMachines',
      kilowattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'UK South',
      usesAverageCPUConstant: false,
    },
  }
}

const fakeEmissionFactors: EmissionRatioResult[] = [
  {
    cloudProvider: 'AWS',
    region: 'us-west-1',
    mtPerKwHour: 0.000645,
  },
  {
    cloudProvider: 'AWS',
    region: 'us-west-2',
    mtPerKwHour: 0.000635,
  },
  {
    cloudProvider: 'AWS',
    region: 'us-west-3',
    mtPerKwHour: 0.000475,
  },
  {
    cloudProvider: 'AWS',
    region: 'us-west-4',
    mtPerKwHour: 0.000315,
  },
  {
    cloudProvider: 'AWS',
    region: 'us-east-1',
    mtPerKwHour: 0.000155,
  },
]

const generateEstimations = (
  today: moment.Moment | Date,
  monthsBack: number,
  servicesToTest: string[] = [
    'ebs',
    's3',
    'ec2',
    'rds',
    'lambda',
    'elasticache',
    'computeEngine',
    'virtualMachines',
  ],
): EstimationResult[] => {
  const todayAsMoment: moment.Moment = moment(today)

  const estimationResults: EstimationResult[] = []

  for (let i = 0; i <= monthsBack; i++) {
    const timestamp: Date = todayAsMoment
      .clone()
      .utc()
      .subtract(i, 'M')
      .hours(0)
      .minutes(0)
      .seconds(0)
      .millisecond(0)
      .toDate()
    const estimationsForMonth: EstimationResult = {
      timestamp,
      serviceEstimates: servicesToTest.map((serviceToTest: string) => {
        return fakeServiceMap()[serviceToTest]
      }),
    }

    estimationResults.push(estimationsForMonth)
  }

  return estimationResults
}

export { fakeEmissionFactors, generateEstimations }
