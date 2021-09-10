/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect, useState } from 'react'
import { pluck, uniq } from 'ramda'
import { EstimationResult, ServiceData } from '@cloud-carbon-footprint/common'
import {
  cloudEstPerDay,
  ChartDataTypes,
  FilterResultResponse,
  DropdownOption,
  UnknownTypes,
} from 'Types'

const sumServiceTotals = (
  data: EstimationResult[],
): { [key: string]: cloudEstPerDay[] } => {
  const co2Series: cloudEstPerDay[] = []
  const kilowattHoursSeries: cloudEstPerDay[] = []
  const costSeries: cloudEstPerDay[] = []

  data.forEach((estimatationResult) => {
    let total = 0
    let totalCost = 0
    let totalWattHours = 0

    let usesAverageCPUConstant = false

    estimatationResult.serviceEstimates.forEach((serviceEstimate) => {
      if (serviceEstimate.usesAverageCPUConstant === true) {
        usesAverageCPUConstant = true
      }
      total += serviceEstimate.co2e
      totalCost += serviceEstimate.cost
      totalWattHours += serviceEstimate.kilowattHours
    })

    co2Series.push({
      x: estimatationResult.timestamp,
      y: roundNumberBasedOnSize(total, 4),
      usesAverageCPUConstant: usesAverageCPUConstant,
      cost: roundNumberBasedOnSize(totalCost, 2),
      kilowattHours: roundNumberBasedOnSize(totalWattHours, 2),
    })

    kilowattHoursSeries.push({
      x: estimatationResult.timestamp,
      y: roundNumberBasedOnSize(totalWattHours, 2),
    })

    costSeries.push({
      x: estimatationResult.timestamp,
      y: roundNumberBasedOnSize(totalCost, 2),
    })
  })

  return {
    co2Series,
    kilowattHoursSeries,
    costSeries,
  }
}

export const getMaxOfDataSeries = (series: cloudEstPerDay[]): number => {
  if (series.length === 0) return 1
  return Math.max(
    ...series.map((dataPair) => {
      return dataPair.y
    }),
  )
}

const roundNumberBasedOnSize = (number: number, digits: number): number => {
  return number >= 1
    ? Number(number.toFixed(digits))
    : Number(number.toExponential(digits - 1))
}

const getPropertyFromDataType = (
  dataType: string,
  value: ServiceData,
): string => {
  const dataTypeMapping: { [key: string]: string } = {
    [ChartDataTypes.REGION]: value.region,
    [ChartDataTypes.SERVICE]: value.serviceName,
    [ChartDataTypes.ACCOUNT]: value.accountName,
  }

  return dataTypeMapping[dataType]
}

const checkUnknownTypes = (dataType: string, value: ServiceData) => {
  if (dataType === ChartDataTypes.ACCOUNT && value.accountName === null)
    value.accountName = `${UnknownTypes.UNKNOWN_ACCOUNT}`

  if (dataType === ChartDataTypes.SERVICE && value.serviceName === null)
    value.serviceName = `${UnknownTypes.UNKNOWN_SERVICE}`

  if (
    dataType === ChartDataTypes.REGION &&
    value.region.toLowerCase() === 'unknown'
  )
    value.region = `${UnknownTypes.UNKNOWN_REGION}`
}

const sumCO2ByServiceOrRegion = (
  data: EstimationResult[],
  dataType: string,
): { string: [string, number] } => {
  const serviceEstimates = data.flatMap(
    (estimationResult) => estimationResult.serviceEstimates,
  )

  return serviceEstimates.reduce((acc, _initialValue, index, arr) => {
    const value = arr[index]

    checkUnknownTypes(dataType, value)

    const property = getPropertyFromDataType(dataType, value)

    if (acc.hasOwnProperty(property)) {
      acc[property] = [value.cloudProvider, acc[property][1] + value.co2e] // { ec2: 18 }
    } else {
      acc[property] = [value.cloudProvider, value.co2e]
    }

    return acc
  }, Object.create({}))
}

const sumCO2 = (data: EstimationResult[]): number => {
  const serviceEstimates = data.flatMap(
    (estimationResult) => estimationResult.serviceEstimates,
  )
  return serviceEstimates.reduce(
    (acc, currentValue) => acc + currentValue.co2e,
    0,
  )
}

const useFilterDataFromEstimates = (
  data: EstimationResult[],
): FilterResultResponse => {
  const [filteredData] = useState(data)
  const [filterResultResponse, setFilterResultResponse] =
    useState<FilterResultResponse>({ accounts: [], services: [] })

  useEffect(() => {
    const serviceEstimates = pluck('serviceEstimates', data).flat()

    const accountNames: DropdownOption[] = []
    const serviceNames: DropdownOption[] = []

    serviceEstimates.forEach((estimate) => {
      const { cloudProvider, accountName, serviceName } = estimate
      accountNames.push({
        cloudProvider: cloudProvider?.toLowerCase(),
        key: accountName ? accountName : `${UnknownTypes.UNKNOWN_ACCOUNT}`,
        name: accountName ? accountName : `${UnknownTypes.UNKNOWN_ACCOUNT}`,
      })

      serviceNames.push({
        cloudProvider: cloudProvider?.toLowerCase(),
        key: serviceName ? serviceName : `${UnknownTypes.UNKNOWN_SERVICE}`,
        name: serviceName ? serviceName : `${UnknownTypes.UNKNOWN_SERVICE}`,
      })
    })
    setFilterResultResponse({
      accounts: uniq(accountNames),
      services: uniq(serviceNames),
    })
  }, [data, filteredData])

  return filterResultResponse
}

export {
  sumCO2,
  sumCO2ByServiceOrRegion,
  sumServiceTotals,
  useFilterDataFromEstimates,
}
