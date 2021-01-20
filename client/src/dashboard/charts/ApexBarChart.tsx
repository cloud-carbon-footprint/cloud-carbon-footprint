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

  // Added to dynamically resize height based on visible accounts/regions/services
  // noted that when data entries were minimal, the bars where extremely thin
  const determineHeight: () => number = () => {
    if (dataEntries.length === 1) {
      return dataEntries.length * 90
    } else if (dataEntries.length < 5) {
      return dataEntries.length * 70
    }

    return dataEntries.length * 55
  }

  const options = {
    series: [
      {
        name: 'Total CO2e',
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
          return `${value.toFixed(3)} mt`
        },
      },
    },
    height: determineHeight(),
  }

  return (
    <div className={classes.root}>
      <Chart options={options} series={options.series} type="bar" height={options.height} />
    </div>
  )
}
