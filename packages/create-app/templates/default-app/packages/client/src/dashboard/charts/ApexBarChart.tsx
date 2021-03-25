/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent, useState } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Chart from 'react-apexcharts'

import { sumCO2ByServiceOrRegion } from '../transformData'
import { ApexChartProps } from './common/ChartTypes'
import { Page, Pagination } from './Pagination'
import NoDataPage from '../NoDataPage'

const mapToRange = (
  value: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number,
) => {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

export interface Entry {
  x: string
  y: number
}

export const ApexBarChart: FunctionComponent<ApexChartProps> = ({
  data,
  dataType,
}) => {
  const [pageData, setPageData] = useState<Page<Entry>>({ data: [], page: 0 })
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
  const smallestCO2E = dataEntries?.[dataEntries?.length - 1]?.y
  const largestCO2E = dataEntries?.[0]?.y
  const totalCO2EByDataType = dataEntries.reduce((acc, currentValue) => {
    return acc + currentValue.y
  }, 0)

  const pageSize = 10
  const minThreshold = 1
  const maxThreshold = 100
  const mappedDataEntries: Entry[] = dataEntries.map((entry) => {
    const yEntry = mapToRange(
      entry.y,
      smallestCO2E,
      largestCO2E,
      minThreshold,
      maxThreshold,
    )
    return { x: entry.x, y: isNaN(yEntry) ? maxThreshold : yEntry }
  })

  const options = {
    series: [
      {
        name: 'Total CO2e',
        data: pageData.data,
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
      padding: {
        left: 32,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: `${7 * pageData.data.length}%`,
        distributed: false,
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      formatter: function (_: number, opts: { dataPointIndex: number }) {
        const currentCO2E =
          dataEntries[pageData.page * pageSize + opts.dataPointIndex].y

        const formattedPercentage = (currentCO2E / totalCO2EByDataType) * 100
        return formattedPercentage < 0.01
          ? '< 0.01 %'
          : `${formattedPercentage.toFixed(2)} %`
      },
      offsetX: 16,
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
      max: maxThreshold,
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
        formatter: function (value: number, opts: { dataPointIndex: number }) {
          return `${dataEntries[
            pageData.page * pageSize + opts.dataPointIndex
          ].y.toFixed(3)} metric tons`
        },
      },
    },
    height: '500px',
  }

  const handlePage = (page: Page<Entry>) => {
    setPageData(page)
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
      {pageData && pageData.data && pageData.data.length ? (
        <Chart
          options={options}
          series={options.series}
          type="bar"
          height={options.height}
        />
      ) : (
        <NoDataPage isTop={false} />
      )}
      <Pagination
        data={mappedDataEntries}
        pageSize={pageSize}
        handlePage={handlePage}
      />
    </div>
  )
}
