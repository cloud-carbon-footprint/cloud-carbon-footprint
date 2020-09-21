import { EstimationResult, cloudEstPerDay, CloudEstimationTypes } from '../types'

const dailyTotals = (data: EstimationResult[]): { [key: string]: cloudEstPerDay[] | number } => {
  const co2e = dailyTotalsFor(CloudEstimationTypes.co2e, data)
  const maxCo2e = Math.max(
    ...co2e.map((dataPair) => {
      return dataPair.y
    }),
  )

  return {
    co2e,
    maxCo2e,
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
