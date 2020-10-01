import moment, { Moment } from 'moment'
import { EstimationResult, serviceEstimate } from '../types'

const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * Math.floor(max))
}

const getRandomNumberInRange = (minValue: number, maxValue: number): number => {
  return Math.max(Math.random() * maxValue, minValue + Math.random())
}

const fakeServiceMap: (timestamp: Date) => { [key: string]: serviceEstimate } = (timestamp: Date) => {
  return {
    ebs: {
      timestamp,
      serviceName: 'ebs',
      wattHours: Math.random(),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-1',
      estimated: false,
    },
    s3: {
      timestamp,
      serviceName: 's3',
      wattHours: Math.random() / 1000,
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-1',
      estimated: false,
    },
    ec2: {
      timestamp,
      serviceName: 'ec2',
      wattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-1',
      estimated: false,
    },
    rds: {
      timestamp,
      serviceName: 'rds',
      wattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-1',
      estimated: false,
    },
    lambda: {
      timestamp,
      serviceName: 'lambda',
      wattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-1',
      estimated: false,
    },
    elasticache: {
      timestamp,
      serviceName: 'elasticache',
      wattHours: getRandomNumberInRange(50, 75),
      co2e: getRandomInt(6),
      cost: getRandomNumberInRange(1.5, 2),
      region: 'us-east-1',
      estimated: false,
    },
  }
}

const generateEstimations = (
  today: moment.Moment | Date,
  monthsBack: number,
  servicesToTest: string[] = ['ebs', 's3', 'ec2', 'rds', 'lambda', 'elasticache'],
): EstimationResult[] => {
  const todayAsMoment: moment.Moment = moment(today)

  const estimationResults: EstimationResult[] = []

  for (let i: number = 0; i <= monthsBack; i++) {
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
        return fakeServiceMap(timestamp)[serviceToTest]
      }),
    }

    estimationResults.push(estimationsForMonth)
  }

  return estimationResults
}

export default generateEstimations
