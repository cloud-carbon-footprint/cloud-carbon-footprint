/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent, useState } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Chart from 'react-apexcharts'

import { sumCO2, sumCO2ByServiceOrRegion } from '../transformData'
import { ApexChartProps } from './common/ChartTypes'
import Pagination from './Pagination'

export const ApexBarChart: FunctionComponent<ApexChartProps> = ({ data, dataType }) => {
  const [pageData, setPageData] = useState<{ x: string; y: number }[]>([])

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

  const largestCO2E = dataEntries?.[0]?.y
  const pageSize = 10
  const options = {
    series: [
      {
        name: 'Total CO2e',
        data: pageData,
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
        barHeight: `${7 * pageData.length}%`,
        distributed: false,
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      formatter: function (value: number) {
        const formattedPercentage = (value / sumCO2(data)) * 100
        return formattedPercentage < 0.01 ? '< 0.01 %' : `${formattedPercentage.toFixed(2)} %`
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

  const handlePage = (pageData: { x: string; y: number }[]) => {
    setPageData(pageData)
  }

  return (
    <div
      style={{
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      {pageData && pageData.length ? (
        <Chart options={options} series={options.series} type="bar" height={options.height} />
      ) : (
        <div style={{ textAlign: 'center' }}>Select a cloud provider.</div>
      )}
      <Pagination data={dataEntries} pageSize={pageSize} handlePage={handlePage} />
    </div>
  )
}
