/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Chart from 'react-apexcharts'

import { getChartColors } from '../../themes'
import { sumCO2ByServiceOrRegion } from '../transformData'
import { EstimationResult } from '../../models/types'

export const ApexDonutChart: FunctionComponent<ApexDonutChartProps> = ({ data, dataType }) => {
  const theme = useTheme()
  const chartColors = getChartColors(theme)

  const donutData = sumCO2ByServiceOrRegion(data, dataType)

  const options = {
    chart: {
      background: theme.palette.background.paper,
    },
    colors: chartColors,
    dataLabels: {
      style: {
        fontSize: '1rem',
      },
      dropShadow: {
        enabled: true,
        top: 0,
        left: 0,
        blur: 3,
        color: theme.palette.grey[800],
        opacity: 0.5,
      },
    },
    labels: Object.keys(donutData),
    legend: {
      position: 'bottom',
      offsetY: -8,
    },
    series: Object.values(donutData),
    stroke: {
      colors: [theme.palette.background.default],
    },
    title: {
      offsetY: -8,
      style: {
        fontSize: '24px',
      },
    },
    height: '500px',
    theme: {
      mode: theme.palette.type,
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: function (value: number) {
          return `${value.toFixed(3)} mt CO2e`
        },
      },
    },
  }

  return <Chart options={options} series={options.series} type="donut" height={options.height} />
}

type ApexDonutChartProps = {
  data: EstimationResult[]
  dataType: string
}
