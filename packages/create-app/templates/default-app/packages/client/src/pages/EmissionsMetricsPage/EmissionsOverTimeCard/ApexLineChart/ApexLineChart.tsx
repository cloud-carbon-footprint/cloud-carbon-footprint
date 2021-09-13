/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, useEffect } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ApexCharts from 'apexcharts'
import Chart from 'react-apexcharts'
import { useTheme } from '@material-ui/core/styles'
import { GetApp, PanTool, RotateLeft, ZoomIn } from '@material-ui/icons'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { ApexChartProps, DateRange } from 'Types'
import { getChartColors } from 'utils/themes'
import { sumServiceTotals, getMaxOfDataSeries } from 'utils/helpers'
import { filterBy, sortByDate } from './helpers'
import CustomTooltip from './CustomTooltip'
import * as _ from 'lodash'

type LegendToggle = {
  [key: string]: boolean
}

const ApexLineChart: FunctionComponent<ApexChartProps> = ({ data }) => {
  const theme = useTheme()
  const colors = getChartColors(theme)
  const [blue, yellow, green] = [colors[0], colors[5], colors[8]]

  const [dateRange, setDateRange] = React.useState<DateRange>({
    min: null,
    max: null,
  })
  const [chartData, setChartData] = React.useState<EstimationResult[]>([])
  const [defaultRange, setDefaultRange] = React.useState<DateRange>({
    min: null,
    max: null,
  })
  const [toggledSeries, setToggledSeries] = React.useState<LegendToggle[]>([
    { CO2e: true },
    { 'Kilowatt Hours': false },
    { Cost: false },
  ])

  const filteredByZoomRange = filterBy(chartData, dateRange, defaultRange)

  // We need to get the HTML string version of these icons since ApexCharts doesn't take in custom React components.
  // Why, you might ask? Don't ask me, ask ApexCharts.
  const GetAppIconHTML = renderToStaticMarkup(<GetApp />)
  const PanToolIconHTML = renderToStaticMarkup(<PanTool />)
  const RotateLeftIconHTML = renderToStaticMarkup(<RotateLeft />)
  const ZoomInIconHTML = renderToStaticMarkup(<ZoomIn />)

  const cloudEstimationData = sumServiceTotals(filteredByZoomRange)
  const co2SeriesData = cloudEstimationData.co2Series
  const kilowattHoursSeriesData = cloudEstimationData.kilowattHoursSeries
  const costSeriesData = cloudEstimationData.costSeries
  const maxCO2e = getMaxOfDataSeries(co2SeriesData)
  const maxKilowattHours = getMaxOfDataSeries(kilowattHoursSeriesData)
  const maxCost = getMaxOfDataSeries(costSeriesData)

  useEffect(() => {
    const newSortedData = sortByDate(data)
    const newDefaultRange = {
      min: newSortedData[0]?.timestamp
        ? new Date(newSortedData[0]?.timestamp)
        : null,
      max: newSortedData[newSortedData.length - 1]?.timestamp
        ? new Date(newSortedData[newSortedData.length - 1]?.timestamp)
        : null,
    }

    if (!_.isEqual(chartData, newSortedData)) setChartData(newSortedData)
    if (
      newDefaultRange.min instanceof Date &&
      newDefaultRange.max instanceof Date
    ) {
      if (!_.isEqual(defaultRange, newDefaultRange)) {
        setDateRange(newDefaultRange)
        setDefaultRange(newDefaultRange)
      }
    }
  }, [data])

  useEffect(() => {
    ApexCharts.exec('lineChart', 'updateSeries', [
      {
        name: 'CO2e',
        data: co2SeriesData,
      },
      {
        name: 'Kilowatt Hours',
        data: kilowattHoursSeriesData,
      },
      {
        name: 'Cost',
        data: costSeriesData,
      },
    ])

    toggledSeries.forEach((legendToggle: LegendToggle) => {
      const [seriesKey, toggleValue] = Object.entries(legendToggle)[0]
      toggleValue
        ? ApexCharts.exec('lineChart', 'showSeries', [seriesKey])
        : ApexCharts.exec('lineChart', 'hideSeries', [seriesKey])
    })
  }, [co2SeriesData, kilowattHoursSeriesData, costSeriesData, toggledSeries])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    markers: {
      size: 5,
    },
    chart: {
      events: {
        beforeZoom: (chart: unknown, { xaxis }: { xaxis: DateRange }) => {
          const newFilteredData = filterBy(data, xaxis, defaultRange)

          if (newFilteredData.length >= 2) {
            setDateRange(xaxis)
            return {
              xaxis,
            }
          }
          return {
            dateRange,
          }
        },
        beforeResetZoom: () => {
          setDateRange(defaultRange)
        },
        legendClick: (chart: unknown, seriesIndex: number) => {
          const [seriesKey, toggledValue] = Object.entries(
            toggledSeries[seriesIndex],
          )[0]
          const toggleCheck = toggledSeries.filter(
            (series) => !!Object.values(series)[0],
          )
          const newToggledSeries = [...toggledSeries]
          newToggledSeries[seriesIndex] = {
            [seriesKey]: !toggledValue,
          }
          setToggledSeries(newToggledSeries)
          if (
            toggleCheck.length === 1 &&
            Object.keys(toggleCheck[0])[0] === seriesKey
          )
            setToggledSeries(toggledSeries)
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
        name: 'Kilowatt Hours',
        data: kilowattHoursSeriesData,
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
          <CustomTooltip dataPoint={co2SeriesData[dataPointIndex]} />,
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
        offsetY: 18,
        style: {
          fontSize: '15px',
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
        tickAmount: 10,
        decimalsInFloat: 3,
      },
      {
        max: 1.1 * maxKilowattHours,
        title: {
          text: 'Kilowatt Hours (kWh)',
          opposite: -8,
          style: {
            fontSize: '15px',
            color: yellow,
          },
        },
        tickAmount: 10,
        decimalsInFloat: 2,
        opposite: true,
        axisBorder: {
          show: true,
          color: yellow,
        },
        axisTicks: {
          show: false,
        },
        showAlways: false,
      },
      {
        max: 1.1 * maxCost,
        title: {
          text: 'Cost ($)',
          offsetX: 6,
          style: {
            fontSize: '15px',
            color: green,
          },
        },
        tickAmount: 10,
        decimalsInFloat: 2,
        opposite: true,
        axisBorder: {
          show: true,
          color: green,
          offsetX: -5,
        },
        axisTicks: {
          show: false,
        },
        showAlways: false,
      },
    ],
    grid: {
      padding: {
        bottom: +15,
        right: +20,
      },
    },
  }

  return (
    <Chart
      aria-label="apex-line-chart"
      options={options}
      series={options.series}
      type="line"
      height={options.height}
    />
  )
}

export default ApexLineChart
