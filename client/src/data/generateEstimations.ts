import moment, { Moment } from 'moment'
import { EstimationResult } from '../types'

const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * Math.floor(max))
}

const getRandomNumberInRange = (minValue: number, maxValue: number): number => {
  return Math.max(Math.random() * maxValue, minValue + Math.random())
}

const generateEstimations = (today: moment.Moment, monthsBack: number): EstimationResult[] => {
  const todayAsMoment: moment.Moment = moment(today)

  const estimationResults: EstimationResult[] = []

  for (let i: number = 0; i <= monthsBack; i++) {
    const timestamp: Date = today.clone().utc().subtract(i, 'M').hours(0).minutes(0).seconds(0).millisecond(0).toDate()
    const estimationsForMonth: EstimationResult = {
      timestamp,
      serviceEstimates: [
        {
          timestamp,
          serviceName: 'ebs',
          wattHours: Math.random(),
          co2e: getRandomInt(6),
          cost: 0,
        },
        {
          timestamp,
          serviceName: 's3',
          wattHours: Math.random() / 1000,
          co2e: getRandomInt(6),
          cost: 0,
        },
        {
          timestamp,
          serviceName: 'ec2',
          wattHours: getRandomNumberInRange(50, 75),
          co2e: getRandomInt(6),
          cost: getRandomNumberInRange(1.5, 2),
        },
      ],
    }

    estimationResults.push(estimationsForMonth)
  }

  return estimationResults
}

export default generateEstimations
