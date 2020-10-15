import { EstimationResult, cloudEstPerDay } from '../types'

const sumServiceTotals = (data: EstimationResult[]): { [key: string]: cloudEstPerDay[] | number } => {
  let co2Series: cloudEstPerDay[] = []
  let wattHoursSeries: cloudEstPerDay[] = []
  let costSeries: cloudEstPerDay[] = []

  data.forEach((EstimationResult) => {
    let total = 0
    let totalCost = 0
    let totalWattHours = 0

    let usesAverageCPUConstant = false

    EstimationResult.serviceEstimates.forEach((serviceEstimate) => {
      if (serviceEstimate.usesAverageCPUConstant === true) {
        usesAverageCPUConstant = true
      }
      total += serviceEstimate.co2e
      totalCost += serviceEstimate.cost
      totalWattHours += serviceEstimate.wattHours
    })

    co2Series.push({
      x: EstimationResult.timestamp,
      y: Number(total.toFixed(2)),
      usesAverageCPUConstant: usesAverageCPUConstant,
      cost: Number(totalCost.toFixed(2)),
      wattHours: Number(totalWattHours.toFixed(2)),
    })

    wattHoursSeries.push({
      x: EstimationResult.timestamp,
      y: Number(totalWattHours.toFixed(2)),
    })

    costSeries.push({
      x: EstimationResult.timestamp,
      y: Number(totalCost.toFixed(2)),
    })
  })

  const maxCo2e = Math.max(
    ...co2Series.map((dataPair) => {
      return dataPair.y
    }),
  )

  return {
    maxCo2e,
    co2Series,
    wattHoursSeries,
    costSeries,
  }
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

export { sumCO2, sumCO2ByService, sumServiceTotals }
