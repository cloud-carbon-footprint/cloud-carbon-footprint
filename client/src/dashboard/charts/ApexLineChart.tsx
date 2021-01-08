/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent, useState, useEffect } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useTheme } from '@material-ui/core/styles'
import { GetApp, PanTool, RotateLeft, ZoomIn } from '@material-ui/icons'
import Chart from 'react-apexcharts'
import ApexCharts from 'apexcharts'
import moment from 'moment'
import { CustomTooltip } from './CustomTooltip'

import { getChartColors } from '../../themes'
import { sumServiceTotals, getMaxOfDataSeries } from '../transformData'
import { EstimationResult } from '../../models/types'

const formatDateToTime = (timestamp: string | Date) =>
  timestamp instanceof Date ? timestamp.getTime() : new Date(timestamp).getTime()

export const sortByDate = (data: EstimationResult[]): EstimationResult[] =>
  data.sort((a: EstimationResult, b: EstimationResult) => {
    return formatDateToTime(a.timestamp) - formatDateToTime(b.timestamp)
  })

export const ApexLineChart: FunctionComponent<ApexLineChartProps> = ({ data }) => {
  const theme = useTheme()

  useEffect(() => {
    ApexCharts.exec('lineChart', 'hideSeries', ['Watt Hours'])
    ApexCharts.exec('lineChart', 'hideSeries', ['Cost'])
  }, [])

  sortByDate(data)
  // We need to get the HTML string version of these icons since ApexCharts doesn't take in custom React components.
  // Why, you might ask? Don't ask me, ask ApexCharts.
  const GetAppIconHTML = renderToStaticMarkup(<GetApp />)
  const PanToolIconHTML = renderToStaticMarkup(<PanTool />)
  const RotateLeftIconHTML = renderToStaticMarkup(<RotateLeft />)
  const ZoomInIconHTML = renderToStaticMarkup(<ZoomIn />)

  const cloudEstimationData = sumServiceTotals(data)
  const co2SeriesData = cloudEstimationData.co2Series
  const wattHoursSeriesData = cloudEstimationData.wattHoursSeries
  const costSeriesData = cloudEstimationData.costSeries
  const maxCO2e = getMaxOfDataSeries(co2SeriesData)
  const maxWattHours = getMaxOfDataSeries(wattHoursSeriesData)
  const maxCost = getMaxOfDataSeries(costSeriesData)
  const [getMaxCo2] = useState(maxCO2e)
  const [getMaxWattHours] = useState(maxWattHours)
  const [getMaxCost] = useState(maxCost)

  const colors = getChartColors(theme)
  const [blue, yellow, green] = [colors[0], colors[5], colors[8]]

  const options = {
    chart: {
      id: 'lineChart',
      background: theme.palette.background.paper,
      toolbar: {
        tools: {
          download: GetAppIconHTML,
          zoom: ZoomInIconHTML,
          zoomin: false,
          zoomout: false,
          pan: PanToolIconHTML,
          reset: RotateLeftIconHTML,
        },
      },
    },
    colors: [blue, yellow, green],
    height: '500px',
    series: [
      {
        name: 'CO2e',
        data: co2SeriesData,
      },
      {
        name: 'Watt Hours',
        data: wattHoursSeriesData,
      },
      {
        name: 'Cost',
        data: costSeriesData,
      },
    ],
    stroke: {
      width: 1,
    },
    theme: {
      mode: theme.palette.type,
    },
    tooltip: {
      shared: true,
      custom: function ({ dataPointIndex }: { dataPointIndex: number }) {
        return renderToStaticMarkup(
          <CustomTooltip data={co2SeriesData} dataPointIndex={dataPointIndex}></CustomTooltip>,
        )
      },
    },
    title: {
      text: 'Cloud Usage',
      offsetY: -8,
      style: {
        fontSize: '24px',
      },
    },
    xaxis: {
      type: 'datetime',
      title: {
        text: '',
        offsetY: 8,
        style: {
          fontSize: '15px',
        },
      },
      labels: {
        formatter: function (value: number, timestamp: number) {
          return moment.utc(timestamp).format('DD-MMM-YY')
        },
      },
    },
    yaxis: [
      {
        max: getMaxCo2,
        title: {
          text: 'CO2e (metric tons)',
          offsetX: -8,
          style: {
            fontSize: '15px',
          },
        },
        decimalsInFloat: 3,
      },
      {
        max: getMaxWattHours,
        title: {
          text: 'Watt hours (Wh)',
          opposite: -8,
          style: {
            fontSize: '15px',
            color: yellow,
          },
        },
        decimalsInFloat: 2,
        opposite: true,
        axisBorder: {
          show: true,
          color: yellow,
        },
        axisTicks: {
          show: true,
        },
        showAlways: false,
      },
      {
        max: getMaxCost,
        title: {
          text: 'Cost ($)',
          offsetX: -8,
          style: {
            fontSize: '15px',
            color: green,
          },
        },
        decimalsInFloat: 2,
        opposite: true,
        axisBorder: {
          show: true,
          color: green,
        },
        axisTicks: {
          show: true,
        },
        showAlways: false,
      },
    ],
    grid: {
      padding: {
        bottom: +15,
      },
    },
  }
  return <Chart options={options} series={options.series} type="line" height={options.height} />
}

type ApexLineChartProps = {
  data: EstimationResult[]
}
