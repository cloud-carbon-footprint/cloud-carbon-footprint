/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import moment from 'moment'
import { EstimationResult, serviceEstimate } from '../models/types'

const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * Math.floor(max))
}

const getRandomNumberInRange = (minValue: number, maxValue: number): number => {
  return Math.max(Math.random() * maxValue, minValue + Math.random())
}

const fakeServiceMap: () => { [key: string]: serviceEstimate } = () => {
  return {
    ebs: {
      cloudProvider: 'AWS',
      accountName: `aws account ${getRandomInt(5)}`,
      serviceName: 'ebs',
      kilowattHours: Math.random(),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-1',
      usesAverageCPUConstant: false,
    },
    s3: {
      cloudProvider: 'AWS',
      accountName: `aws account ${getRandomInt(5)}`,
      serviceName: 's3',
      kilowattHours: Math.random() / 1000,
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-2',
      usesAverageCPUConstant: false,
    },
    ec2: {
      cloudProvider: 'AWS',
      accountName: `aws account ${getRandomInt(5)}`,
      serviceName: 'ec2',
      kilowattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-west-1',
      usesAverageCPUConstant: false,
    },
    rds: {
      cloudProvider: 'AWS',
      accountName: `aws account ${getRandomInt(5)}`,
      serviceName: 'rds',
      kilowattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-west-2',
      usesAverageCPUConstant: false,
    },
    lambda: {
      cloudProvider: 'AWS',
      accountName: `aws account ${getRandomInt(5)}`,
      serviceName: 'lambda',
      kilowattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-1',
      usesAverageCPUConstant: false,
    },
    elasticache: {
      cloudProvider: 'AWS',
      accountName: `gcp account ${getRandomInt(5)}`,
      serviceName: 'elasticache',
      kilowattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-1',
      usesAverageCPUConstant: false,
    },
    computeEngine: {
      cloudProvider: 'GCP',
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

export default generateEstimations
