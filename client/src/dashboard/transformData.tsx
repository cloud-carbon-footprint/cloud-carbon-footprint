/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import {
  EstimationResult,
  cloudEstPerDay,
  ChartDataTypes,
  serviceEstimate,
  FilterResultResponse,
} from '../models/types'
import { pluck, uniq } from 'ramda'
import { useEffect, useState } from 'react'
const sumServiceTotals = (data: EstimationResult[]): { [key: string]: cloudEstPerDay[] } => {
  const co2Series: cloudEstPerDay[] = []
  const wattHoursSeries: cloudEstPerDay[] = []
  const costSeries: cloudEstPerDay[] = []

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

  return {
    co2Series,
    wattHoursSeries,
    costSeries,
  }
}

export const getMaxOfDataSeries = (series: cloudEstPerDay[]): number => {
  return Math.max(
    ...series.map((dataPair) => {
      return dataPair.y
    }),
  )
}

const getPropertyFromDataType = (dataType: string, value: serviceEstimate): string => {
  const dataTypeMapping: { [key: string]: string } = {
    [ChartDataTypes.REGION]: value.region,
    [ChartDataTypes.SERVICE]: value.serviceName,
    [ChartDataTypes.ACCOUNT]: value.accountName,
  }

  return dataTypeMapping[dataType]
}

const sumCO2ByServiceOrRegion = (data: EstimationResult[], dataType: string): { string: number } => {
  const serviceEstimates = data.flatMap((estimationResult) => estimationResult.serviceEstimates)

  return serviceEstimates.reduce((acc, initialValue, index, arr) => {
    const value = arr[index]

    const property = getPropertyFromDataType(dataType, value)

    if (acc.hasOwnProperty(property)) {
      acc[property] += value.co2e // { ec2: 18 }
    } else {
      acc[property] = value.co2e
    }

    return acc
  }, Object.create({}))
}

const sumCO2 = (data: EstimationResult[]): number => {
  const serviceEstimates = data.flatMap((estimationResult) => estimationResult.serviceEstimates)
  return serviceEstimates.reduce((acc, currentValue) => acc + currentValue.co2e, 0)
}

const useAccountNamesFromEstimates = (data: EstimationResult[]): FilterResultResponse => {
  // console.log(data)
  const [filteredData] = useState(data)
  const [filterResultResponse, setFilterResultResponse] = useState<FilterResultResponse>({ accounts: [] })

  // console.log(filteredData)
  useEffect(() => {
    const serviceEstimates = pluck('serviceEstimates', data).flat()

    const accountNames = serviceEstimates.map((estimate) => {
      return {
        cloudProvider: estimate.cloudProvider.toLowerCase(),
        key: estimate.accountName,
        name: estimate.accountName,
      }
    })
    setFilterResultResponse({ accounts: uniq(accountNames) })
  }, [data, filteredData])

  return filterResultResponse
}

export { sumCO2, sumCO2ByServiceOrRegion, sumServiceTotals, useAccountNamesFromEstimates }
