/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent, useState } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Chart from 'react-apexcharts'

import { sumCO2, sumCO2ByServiceOrRegion } from '../transformData'
import { ApexChartProps } from './common/ChartTypes'

export const ApexBarChart: FunctionComponent<ApexChartProps> = ({ data, dataType }) => {
  const [page, setPage] = useState(0)
  const theme = useTheme()
  const chartColors = [theme.palette.primary.main]
  const barChartData = sumCO2ByServiceOrRegion(data, dataType)

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
          download: `
            <div class="apexcharts-menu-icon" title="Menu">
                <svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path>
                </svg>
            </div>   
           `,
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
        return `${((value / sumCO2(data)) * 100).toFixed(2)} %`
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
      <div>
        <span>
          {visibleRows} of {dataEntries.length}
        </span>
        {page > 0 && <button onClick={() => setPage(page - 1)}>Prev</button>}
        {page < paginatedData.length - 1 && <button onClick={() => setPage(page + 1)}>Next</button>}
      </div>
    </div>
  )
}
