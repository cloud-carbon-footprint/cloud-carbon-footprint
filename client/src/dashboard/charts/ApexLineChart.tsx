/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent, useEffect } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useTheme } from '@material-ui/core/styles'
import { GetApp, PanTool, RotateLeft, ZoomIn } from '@material-ui/icons'
import moment from 'moment'
import { CustomTooltip } from './CustomTooltip'

import { getChartColors } from '../../themes'
import { sumServiceTotals, getMaxOfDataSeries } from '../transformData'
import { EstimationResult } from '../../models/types'
import Chart from 'react-apexcharts'
import ApexCharts from 'apexcharts'

export interface DateRange {
  min: Date | null
  max: Date | null
}
const formatDateToTime = (timestamp: string | Date) =>
  timestamp instanceof Date ? timestamp.getTime() : new Date(timestamp).getTime()

export const sortByDate = (data: EstimationResult[]): EstimationResult[] => {
  return data.sort((a: EstimationResult, b: EstimationResult) => {
    return formatDateToTime(a.timestamp) - formatDateToTime(b.timestamp)
  })
}
export const filterBy = (data: EstimationResult[], range: DateRange): EstimationResult[] => {
  const min = formatDateToTime(range.min as Date)
  const max = formatDateToTime(range.max as Date)
  return data.filter((a: EstimationResult) => {
    const result = formatDateToTime(a.timestamp)
    return result >= min && result <= max
  })
}

export const ApexLineChart: FunctionComponent<ApexLineChartProps> = ({ data }) => {
  const theme = useTheme()
  const sortedData = sortByDate(data)
  const defaultRange = {
    min: sortedData[0]?.timestamp
      ? new Date(sortedData[0]?.timestamp)
      : moment.utc(Date.now()).subtract(7, 'd').toDate(),
    max: sortedData[sortedData.length - 1]?.timestamp
      ? new Date(sortedData[sortedData.length - 1]?.timestamp)
      : moment.utc(Date.now()).toDate(),
  }
  const [dateRange, setDateRange] = React.useState<DateRange>(defaultRange)

  useEffect(() => {
    ApexCharts.exec('lineChart', 'hideSeries', ['Watt Hours'])
    ApexCharts.exec('lineChart', 'hideSeries', ['Cost'])
  }, [])

  useEffect(() => {
    setDateRange(defaultRange)
  }, [data])

  const filteredByZoomRange = filterBy(sortedData, dateRange)
  // We need to get the HTML string version of these icons since ApexCharts doesn't take in custom React components.
  // Why, you might ask? Don't ask me, ask ApexCharts.
  const GetAppIconHTML = renderToStaticMarkup(<GetApp />)
  const PanToolIconHTML = renderToStaticMarkup(<PanTool />)
  const RotateLeftIconHTML = renderToStaticMarkup(<RotateLeft />)
  const ZoomInIconHTML = renderToStaticMarkup(<ZoomIn />)

  const cloudEstimationData = sumServiceTotals(filteredByZoomRange)
  const co2SeriesData = cloudEstimationData.co2Series
  const wattHoursSeriesData = cloudEstimationData.wattHoursSeries
  const costSeriesData = cloudEstimationData.costSeries
  const maxCO2e = getMaxOfDataSeries(co2SeriesData)
  const maxWattHours = getMaxOfDataSeries(wattHoursSeriesData)
  const maxCost = getMaxOfDataSeries(costSeriesData)

  const colors = getChartColors(theme)
  const [blue, yellow, green] = [colors[0], colors[5], colors[8]]

  const options = {
    chart: {
      events: {
        zoomed: (chart: unknown, { xaxis }: { xaxis: DateRange }) => {
          setDateRange(xaxis)
          return {
            xaxis,
          }
        },
        beforeResetZoom: () => {
          setDateRange(defaultRange)
          return {
            xaxis: defaultRange,
          }
        },
      },
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
        return renderToStaticMarkup(<CustomTooltip data={co2SeriesData} dataPointIndex={dataPointIndex} />)
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
        max: 1.1 * maxCO2e,
        title: {
          text: 'CO2e (metric tons)',
          offsetX: -8,
          style: {
            fontSize: '15px',
          },
        },
        decimalsInFloat: 3,
        forceNiceScale: true,
      },
      {
        max: 1.1 * maxWattHours,
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
        forceNiceScale: true,
      },
      {
        max: 1.1 * maxCost,
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
        forceNiceScale: true,
      },
    ],
    grid: {
      padding: {
        bottom: +15,
      },
    },
  }
  return (
    <Chart aria-label="apex-line-chart" options={options} series={options.series} type="line" height={options.height} />
  )
}

type ApexLineChartProps = {
  data: EstimationResult[]
}
