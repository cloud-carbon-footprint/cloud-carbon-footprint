/*
 * © 2021 Thoughtworks, Inc.
 */

import { EmissionRatioResult } from '@cloud-carbon-footprint/common'
import { barChartCustomColors, Page, PageEntry } from 'Types'

const createCustomBarColors = (
  pageData: Page<PageEntry>,
  emissionsData: EmissionRatioResult[],
  mainTheme: string,
): string[] => {
  const regionColorsMap: string[] = []
  pageData.data.forEach((region) => {
    const currentRegion = region.x[0]
    const cloudProvider = region.x[1]
    const parsedCloudProvider = cloudProvider.substring(
      cloudProvider.indexOf('(') + 1,
      cloudProvider.lastIndexOf(')'),
    )
    const regionEmissionData = emissionsData.find(
      (item) =>
        item.region === currentRegion ||
        (item.cloudProvider === parsedCloudProvider &&
          item.region === 'Unknown'),
    ) as EmissionRatioResult
    if (!regionEmissionData) {
      regionColorsMap.push(mainTheme)
    } else {
      const { mtPerKwHour } = regionEmissionData
      let color = barChartCustomColors[0]
      if (mtPerKwHour >= 0.00064) {
        color = barChartCustomColors[4]
      } else if (mtPerKwHour >= 0.00048 && mtPerKwHour < 0.00064) {
        color = barChartCustomColors[3]
      } else if (mtPerKwHour >= 0.00032 && mtPerKwHour < 0.00048) {
        color = barChartCustomColors[2]
      } else if (mtPerKwHour >= 0.00016 && mtPerKwHour < 0.00032) {
        color = barChartCustomColors[1]
      }
      regionColorsMap.push(color)
    }
  })
  return regionColorsMap
}

const mapToRange = (
  value: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number,
): number => {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

export { createCustomBarColors, mapToRange }
