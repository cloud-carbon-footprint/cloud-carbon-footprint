/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Chart from 'react-apexcharts'

import { getChartColors } from '../../../../utils/themes'
import { sumCO2ByServiceOrRegion } from '../../../../utils/helpers'
import { ApexChartProps } from '../../../../Types'

export const ApexDonutChart: FunctionComponent<ApexChartProps> = ({
  data,
  dataType,
}) => {
  const theme = useTheme()
  const chartColors = getChartColors(theme)

  const donutData = sumCO2ByServiceOrRegion(data, dataType)

  const donutDataEntries: {
    serviceOrRegion: string
    c02Value: number
  }[] = Object.entries(donutData)
    .map((item) => ({
      serviceOrRegion: item[0],
      c02Value: item[1][1],
    }))
    .sort((higherC02, lowerCO2) => lowerCO2.c02Value - higherC02.c02Value)

  const sortedServicesOrRegions = donutDataEntries.map(
    (entry) => entry.serviceOrRegion,
  )
  const sortedCO2Emissions = donutDataEntries.map((entry) => entry.c02Value)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
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
    labels: sortedServicesOrRegions,
    legend: {
      position: 'bottom',
      offsetY: -8,
    },
    series: sortedCO2Emissions,
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
          return `${value.toFixed(3)} metric tons`
        },
      },
    },
  }

  return (
    <Chart
      options={options}
      series={options.series}
      type="donut"
      height={options.height}
    />
  )
}
