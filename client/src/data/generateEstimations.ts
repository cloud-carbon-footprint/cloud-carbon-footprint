import moment, { Moment } from 'moment'
import { EstimationResult, RegionResult } from '../types'

const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * Math.floor(max))
}

const getRandomNumberInRange = (minValue: number, maxValue: number): number => {
  return Math.max(Math.random() * maxValue, minValue + Math.random())
}

const getWattHours = (service : string) => {
  switch (service) {
    case 'ebs':
      return Math.random()
    case 's3': 
      return Math.random() / 1000
    case 'ec2':
      return getRandomNumberInRange(50, 75)
    default:
      return 0
  }
}

const getCost = (service : string) => {
  switch (service) {
    case 'ec2':
      return getRandomNumberInRange(1.5, 2)
    default:
      return 0
  }
}

export const generateRegion = (today: moment.Moment | Date, monthsBack: number): RegionResult[] => {
  const todayAsMoment: moment.Moment = moment(today)
  
  const serviceResultMap = new Map()
  serviceResultMap.set('ebs', [])
  serviceResultMap.set('s3', [])
  serviceResultMap.set('ec2', [])

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

      const services = ['ebs', 's3', 'ec2'].forEach((service : string) => {
        serviceResultMap.get(service).push({
          timestamp,
          serviceData: [{
            wattHours: getWattHours(service),
            co2e: getRandomInt(6),
            cost: getCost(service),
          }]
        })
      })
  }

  const regionResults = [{
    region: 'us-east-1',
    serviceResults: ['ebs', 's3', 'ec2'].map(service => {
      return {
        serviceName: service,
        estimationResults: serviceResultMap.get(service)
      }
    })
  }]

  return regionResults
}

const generateEstimations = (today: moment.Moment | Date, monthsBack: number): EstimationResult[] => {
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
      serviceEstimates: [
        {
          timestamp,
          serviceName: 'ebs',
          wattHours: Math.random(),
          co2e: getRandomInt(6),
          cost: 0,
          region: 'us-east-1',
        },
        {
          timestamp,
          serviceName: 's3',
          wattHours: Math.random() / 1000,
          co2e: getRandomInt(6),
          cost: 0,
          region: 'us-east-1',
        },
        {
          timestamp,
          serviceName: 'ec2',
          wattHours: getRandomNumberInRange(50, 75),
          co2e: getRandomInt(6),
          cost: getRandomNumberInRange(1.5, 2),
          region: 'us-east-1',
        },
      ],
    }

    estimationResults.push(estimationsForMonth)
  }

  return estimationResults
}

export default generateEstimations
