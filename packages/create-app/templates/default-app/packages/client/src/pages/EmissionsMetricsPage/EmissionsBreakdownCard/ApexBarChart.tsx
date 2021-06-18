/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { FunctionComponent, useState, Fragment } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Chart from 'react-apexcharts'
import { EmissionRatioResult } from '@cloud-carbon-footprint/common'

import { sumCO2ByServiceOrRegion } from '../../../utils/helpers'
import { ApexChartProps } from '../../../Types'
import { chartBarCustomColors } from '../../../Types'
import Pagination, { Page } from './Pagination'
import CarbonIntensityRange from './CarbonIntensityRange'
import NoDataMessage from '../../../common/NoDataMessage'
import useRemoteEmissionService from '../../../utils/hooks/EmissionFactorServiceHook'

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
  x: string[]
  y: number
}

export const ApexBarChart: FunctionComponent<ApexChartProps> = ({
  data,
  dataType,
}) => {
  const [pageData, setPageData] = useState<Page<Entry>>({ data: [], page: 0 })
  const theme = useTheme()

  const { data: emissionsData, loading: emissionsLoading } =
    useRemoteEmissionService()

  const mainTheme = theme.palette.primary.main
  const darkTheme = theme.palette.primary.dark

  let customBarColors = [mainTheme]
  if (dataType === 'region' && !!emissionsData.length) {
    customBarColors = createCustomBarColors(pageData, emissionsData, mainTheme)
  }

  const barChartData = sumCO2ByServiceOrRegion(data, dataType)

  const dataEntries: { x: string[]; y: number }[] = Object.entries(barChartData)
    .filter((item: [string, [string, number]]) => item[1][1] > 0)
    .map((item) => {
      return {
        x: [item[0], `(${item[1][0]})`],
        y: item[1][1],
      }
    })
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

  const toolbarOffset = {
    x: -120,
    y: dataType === 'region' ? -122 : -55,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    series: [
      {
        name: 'Total CO2e',
        data: pageData.data,
      },
    ],
    colors: customBarColors,
    chart: {
      type: 'bar',
      toolbar: {
        offsetX: toolbarOffset.x,
        offsetY: toolbarOffset.y,
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
        left: dataType === 'region' ? -15 : -5,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: `${7 * pageData.data.length}%`,
        distributed: true,
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      formatter: function (_: number, opts: { dataPointIndex: number }) {
        const currentCO2E =
          dataEntries[pageData.page * pageSize + opts.dataPointIndex]?.y

        const formattedPercentage = (currentCO2E / totalCO2EByDataType) * 100
        return formattedPercentage < 0.01
          ? '< 0.01 %'
          : `${formattedPercentage.toFixed(2)} %`
      },
      offsetX: 16,
      background: {
        enabled: true,
        foreColor: mainTheme,
        borderColor: darkTheme,
        padding: 6,
        borderRadius: 1,
        borderWidth: 1,
        opacity: 0.9,
      },
    },
    xaxis: {
      type: 'category',
      labels: {
        style: {
          fontSize: 0,
        },
      },
      axisBorder: {
        show: false,
      },
      max: maxThreshold,
    },
    yaxis: {
      labels: {
        minWidth: 150,
        maxWidth: 150,
        offsetY: 5,
        style: {
          fontSize: '12px',
        },
      },
    },
    tooltip: {
      fillSeriesColor: false,
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
      {mappedDataEntries?.length && !emissionsLoading ? (
        <Fragment>
          {dataType === 'region' && (
            <CarbonIntensityRange
              startLabel="Low carbon intensity"
              endLabel="High carbon intensity"
              colorRange={chartBarCustomColors}
            />
          )}
          <Chart
            options={options}
            series={options.series}
            type="bar"
            height={options.height}
          />
          <div style={{ paddingTop: '10px' }}>
            <Pagination
              data={mappedDataEntries}
              pageSize={pageSize}
              handlePage={handlePage}
            />
          </div>
        </Fragment>
      ) : (
        <NoDataMessage isTop={false} />
      )}
    </div>
  )
}

export const createCustomBarColors = (
  pageData: Page<Entry>,
  emissionsData: EmissionRatioResult[],
  mainTheme: string,
): string[] => {
  const regionColorsMap: string[] = []
  pageData.data.forEach((region) => {
    const currentRegion = region.x[0]
    let color = chartBarCustomColors[0]
    const regionEmissionData = emissionsData.find(
      (item) => item.region === currentRegion,
    ) as EmissionRatioResult
    if (!regionEmissionData) {
      regionColorsMap.push(mainTheme)
    } else {
      const { mtPerKwHour } = regionEmissionData
      if (mtPerKwHour >= 0.00064) {
        color = chartBarCustomColors[4]
      } else if (mtPerKwHour >= 0.00048 && mtPerKwHour < 0.00064) {
        color = chartBarCustomColors[3]
      } else if (mtPerKwHour >= 0.00032 && mtPerKwHour < 0.00048) {
        color = chartBarCustomColors[2]
      } else if (mtPerKwHour >= 0.00016 && mtPerKwHour < 0.00032) {
        color = chartBarCustomColors[1]
      } else {
        color = chartBarCustomColors[0]
      }
      regionColorsMap.push(color)
    }
  })
  return regionColorsMap
}
