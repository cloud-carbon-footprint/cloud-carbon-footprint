/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent, useState } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Chart from 'react-apexcharts'

import { sumCO2, sumCO2ByServiceOrRegion } from '../transformData'
import { ApexChartProps } from './common/ChartTypes'
import { IconButton, makeStyles } from '@material-ui/core'
import { ChevronLeft, ChevronRight } from '@material-ui/icons'

const useStyles = makeStyles(() => {
  return {
    paginationContainer: {
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
  }
})

export const ApexBarChart: FunctionComponent<ApexChartProps> = ({ data, dataType }) => {
  const [page, setPage] = useState(0)
  const theme = useTheme()
  const chartColors = [theme.palette.primary.main]
  const barChartData = sumCO2ByServiceOrRegion(data, dataType)
  const { paginationContainer } = useStyles()

  const dataEntries: { x: string; y: number }[] = Object.entries(barChartData)
    .filter((item) => item[1] > 0)
    .map((item) => ({
      x: item[0],
      y: item[1],
    }))
    .sort((higherC02, lowerCO2) => lowerCO2.y - higherC02.y)

  const paginatedData = []
  const newEntries = [...dataEntries]
  while (newEntries.length > 0) {
    const paginatedSubData = newEntries.splice(0, 10)
    paginatedData.push(paginatedSubData)
  }

  const largestCO2E = dataEntries?.[0]?.y

  const options = {
    series: [
      {
        name: 'Total CO2e',
        data: paginatedData[page],
      },
    ],
    colors: chartColors,
    chart: {
      type: 'bar',
      toolbar: {
        tools: {
          download: null,
        },
      },
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
      padding: {
        left: 32,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      formatter: function (value: number) {
        const formattedPercentage = (value / sumCO2(data)) * 100
        return formattedPercentage < 0.01 ? '> 0.01 %' : `${formattedPercentage.toFixed(2)} %`
      },
      offsetX: 10,
      background: {
        enabled: true,
        foreColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.dark,
        padding: 6,
        borderRadius: 1,
        borderWidth: 1,
        opacity: 0.9,
      },
    },
    xaxis: {
      type: 'category',
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      max: largestCO2E,
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
    height: '500px',
  }

  const visibleRows = `${page * 10 + 1} - ${page * 10 + paginatedData[page]?.length}`

  return (
    <div>
      <Chart options={options} series={options.series} type="bar" height={options.height} />
      <div className={paginationContainer}>
        <span style={{ color: '#ababab', fontWeight: 700, marginRight: '8px' }}>
          {visibleRows} of {dataEntries.length}
        </span>
        <IconButton
          color="primary"
          aria-label="chevron-left"
          component="span"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          color="primary"
          aria-label="chevron-right"
          component="span"
          disabled={page === paginatedData?.length - 1}
          onClick={() => setPage(page + 1)}
        >
          <ChevronRight />
        </IconButton>
      </div>
    </div>
  )
}
