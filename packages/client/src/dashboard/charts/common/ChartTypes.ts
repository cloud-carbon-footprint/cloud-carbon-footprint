/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { EstimationResult } from '../../../models/types'

export type ApexChartProps = {
  data: EstimationResult[]
  dataType: string
}

export type EmissionsRatios = {
  region: string
  mtPerKwHour: number
}

export const chartBarCustomColors: string[] = [
  '#73B500',
  '#00791E',
  '#D99200',
  '#DF5200',
  '#790000',
]
