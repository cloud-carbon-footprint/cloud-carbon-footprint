import { EstimationResult, co2PerDay } from './types'

const transformData = (data: EstimationResult[]): {}[] => {
  let co2DailyTotals: co2PerDay[] = []

  data.forEach((EstimationResult) => {
    let co2eTotal = 0
    EstimationResult.serviceEstimates.forEach((serviceEstimate) => {
      co2eTotal += serviceEstimate.co2e
    })
    co2DailyTotals.push({ x: EstimationResult.timestamp, y: co2eTotal })
  })
  return co2DailyTotals
}

const sumCO2ByService = (data: EstimationResult[]): { string: number } => {
  const serviceEstimates = data.flatMap((estimationResult) => estimationResult.serviceEstimates)

  return serviceEstimates.reduce((acc, initialValue, index, arr) => {
    const value = arr[index]

    if (acc.hasOwnProperty(value.serviceName)) {
      acc[value.serviceName] += value.co2e // { ec2: 18 }
    } else {
      acc[value.serviceName] = value.co2e
    }

    return acc
  }, Object.create({}))
}

export { sumCO2ByService, transformData }
