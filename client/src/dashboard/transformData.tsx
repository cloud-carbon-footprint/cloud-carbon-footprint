import { EstimationResult, cloudEstPerDay } from '../types'

enum CloudEstimationTypes {
  co2e = 'co2e',
  wattHours = 'wattHours',
  cost = 'cost',
}
const dailyTotals = (data: EstimationResult[]): { [key: string]: cloudEstPerDay[] } => {
  return {
    co2e: dailyTotalsFor(CloudEstimationTypes.co2e, data),
    wattHours: dailyTotalsFor(CloudEstimationTypes.wattHours, data),
    cost: dailyTotalsFor(CloudEstimationTypes.cost, data),
  }
}

const dailyTotalsFor = (costType: CloudEstimationTypes, data: EstimationResult[]) => {
  let dailyTotals: cloudEstPerDay[] = []

  data.forEach((EstimationResult) => {
    let total = 0
    EstimationResult.serviceEstimates.forEach((serviceEstimate) => {
      total += serviceEstimate[costType]
    })
    dailyTotals.push({ x: EstimationResult.timestamp, y: total })
  })
  return dailyTotals
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

const sumCO2 = (data: EstimationResult[]): number => {
  const serviceEstimates = data.flatMap((estimationResult) => estimationResult.serviceEstimates)
  return serviceEstimates.reduce((acc, currentValue) => acc + currentValue.co2e, 0)
}

export { sumCO2, sumCO2ByService, dailyTotals }
