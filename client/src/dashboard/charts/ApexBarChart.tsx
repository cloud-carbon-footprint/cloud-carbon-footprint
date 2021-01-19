/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent } from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Chart from 'react-apexcharts'

import { sumCO2ByServiceOrRegion } from '../transformData'
import { ApexChartProps } from './common/ChartTypes'

const useStyles = makeStyles(() => {
  return {
    root: {
      minHeight: '500px',
      maxHeight: '500px',
      overflowY: 'auto',
    },
  }
})

export const ApexBarChart: FunctionComponent<ApexChartProps> = ({ data, dataType }) => {
  const theme = useTheme()
  const classes = useStyles()
  const chartColors = [theme.palette.primary.main]
  const barChartData = sumCO2ByServiceOrRegion(data, dataType)

  const dataEntries: { x: string; y: number }[] = Object.entries(barChartData)
    .filter((item) => item[1] > 0)
    .map((item) => ({
      x: item[0],
      y: item[1],
    }))
    .sort((higherC02, lowerCO2) => lowerCO2.y - higherC02.y)

  const options = {
    series: [
      {
        data: dataEntries,
      },
    ],
    colors: chartColors,
    chart: {
      type: 'bar',
    },
    grid: {
      show: false,
      yaxis: {
        lines: {
          show: false,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'category',
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '13px',
        },
      },
    },
    tooltip: {
      fillSeriesColor: false,
      x: {
        show: false,
      },
      y: {
        formatter: function (value: number) {
          return `Total CO2e: ${value.toFixed(3)} mt`
        },
      },
    },
    height: dataEntries.length * 40,
  }

  return (
    <div className={classes.root}>
      <Chart options={options} series={options.series} type="bar" height={options.height} />
    </div>
  )
}
