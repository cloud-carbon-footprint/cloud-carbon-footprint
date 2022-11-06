/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect, useState } from 'react'
import { pluck, uniq } from 'ramda'
import {
  EstimationResult,
  RecommendationResult,
  ServiceData,
} from '@cloud-carbon-footprint/common'
import {
  ChartDataTypes,
  cloudEstPerDay,
  Co2eUnit,
  DropdownOption,
  EmissionsAndRecommendationResults,
  FilterResultResponse,
  UnknownTypes,
} from '../../Types'
import { co2eUnitMultiplier } from './units'

const sumServiceTotals = (
  data: EstimationResult[],
): { [key: string]: cloudEstPerDay[] } => {
  const co2Series: cloudEstPerDay[] = []
  const kilowattHoursSeries: cloudEstPerDay[] = []
  const costSeries: cloudEstPerDay[] = []

  data.forEach((estimationResult) => {
    let total = 0
    let totalCost = 0
    let totalWattHours = 0

    let usesAverageCPUConstant = false

    estimationResult.serviceEstimates.forEach((serviceEstimate) => {
      if (serviceEstimate.usesAverageCPUConstant === true) {
        usesAverageCPUConstant = true
      }
      total += serviceEstimate.co2e
      totalCost += serviceEstimate.cost
      totalWattHours += serviceEstimate.kilowattHours
    })

    co2Series.push({
      x: estimationResult.timestamp,
      y: roundNumberBasedOnSize(total, 4),
      usesAverageCPUConstant: usesAverageCPUConstant,
      cost: roundNumberBasedOnSize(totalCost, 2),
      kilowattHours: roundNumberBasedOnSize(totalWattHours, 2),
    })

    kilowattHoursSeries.push({
      x: estimationResult.timestamp,
      y: roundNumberBasedOnSize(totalWattHours, 2),
    })

    costSeries.push({
      x: estimationResult.timestamp,
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
  const max = Math.max(
    ...series.map((dataPair) => {
      return dataPair.y
    }),
  )
  return max ? max : 1
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

const sumEstimates = (
  data: (EstimationResult | ServiceData)[],
  key: string,
): number => {
  let serviceEstimates = data
  //TODO: Clean up this typechecking (should check if data is a type of EstimationResult
  if (data[0] && 'serviceEstimates' in data[0]) {
    const estimationData = data as EstimationResult[]
    serviceEstimates = estimationData.flatMap(
      (estimationResult) => estimationResult.serviceEstimates,
    )
  }
  return serviceEstimates.reduce(
    (acc, currentValue) => acc + currentValue[key],
    0,
  )
}

const sumRecommendations = (
  data: RecommendationResult[],
  key: string,
): number => {
  return data.reduce((acc, currentValue) => acc + currentValue[key], 0)
}

const calculatePercentChange = (
  oldAmount: number,
  newAmount: number,
): number => {
  const result = ((oldAmount - newAmount) / Math.abs(oldAmount)) * 100
  return Math.ceil(result)
}

const formattedNumberWithCommas = (num: number, decimalPlaces = 2): string =>
  num.toLocaleString(undefined, {
    maximumFractionDigits: decimalPlaces,
  })

const useFilterDataFromEstimates = (
  data: EstimationResult[],
): FilterResultResponse => {
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
  }, [data])

  return filterResultResponse
}

const useFilterDataFromRecommendations = (
  data: EmissionsAndRecommendationResults,
): FilterResultResponse => {
  const [filteredData] = useState(data)
  const [filterResultResponse, setFilterResultResponse] =
    useState<FilterResultResponse>({
      accounts: [],
      regions: [],
      recommendationTypes: [],
    })

  useEffect(() => {
    const accountNames: DropdownOption[] = []
    const regions: DropdownOption[] = []
    const recommendationTypes: DropdownOption[] = []

    const dataTypes = Object.keys(data)
    dataTypes.forEach((dataType) => {
      const incomingDataResults = data[dataType]
      incomingDataResults.forEach((result) => {
        const { cloudProvider, accountName, region } = result

        accountNames.push({
          cloudProvider: cloudProvider?.toLowerCase(),
          key: accountName ? accountName : `${UnknownTypes.UNKNOWN_ACCOUNT}`,
          name: accountName ? accountName : `${UnknownTypes.UNKNOWN_ACCOUNT}`,
        })
        regions.push({
          cloudProvider: cloudProvider?.toLowerCase(),
          key: region ? region : `${UnknownTypes.UNKNOWN_REGION}`,
          name: region ? region : `${UnknownTypes.UNKNOWN_REGION}`,
        })
        if (dataType === 'recommendations') {
          const { recommendationType } = result
          recommendationTypes.push({
            cloudProvider: cloudProvider?.toLowerCase(),
            key: recommendationType
              ? recommendationType
              : `${UnknownTypes.UNKNOWN_RECOMMENDATION_TYPE}`,
            name: recommendationType
              ? recommendationType
              : `${UnknownTypes.UNKNOWN_RECOMMENDATION_TYPE}`,
          })
        }
      })
    })

    setFilterResultResponse({
      accounts: uniq(accountNames),
      regions: uniq(regions),
      recommendationTypes: uniq(recommendationTypes),
    })
  }, [data.recommendations, filteredData])

  return filterResultResponse
}

/**
 * Formats the value so that it has at most 3 fraction digits and substitutes
 * "< 0.001" if the value is greater than zero but otherwise would be formatted
 * as zero.
 *
 * @param rawValue Raw numeric value to format
 */
function tableFormatNearZero(rawValue: number): string {
  const formattedValue = rawValue
    .toLocaleString(undefined, {
      maximumFractionDigits: 3,
    })
    .replace(',', '')
  return formattedValue === '0' && rawValue > 0 ? '< 0.001' : formattedValue
}

/**
 * Formats the raw co2e value, converting to the specified unit as required
 *
 * @param unit The target unit
 * @param rawValue Raw numeric co2e value in metric tonnes
 */
function tableFormatRawCo2e(unit: Co2eUnit, rawValue: number): string {
  const multiplier = co2eUnitMultiplier[unit]
  return tableFormatNearZero(rawValue * multiplier)
}

export {
  sumEstimates,
  sumRecommendations,
  calculatePercentChange,
  formattedNumberWithCommas,
  sumCO2ByServiceOrRegion,
  sumServiceTotals,
  useFilterDataFromEstimates,
  useFilterDataFromRecommendations,
  tableFormatNearZero,
  tableFormatRawCo2e,
}
