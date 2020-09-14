import React, { FunctionComponent } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useTheme } from '@material-ui/core/styles'
import { GetApp, PanTool, RotateLeft, ZoomIn } from '@material-ui/icons'
import Chart from 'react-apexcharts'
import moment from 'moment'

import { getChartColors } from '../../themes'
import { transformData } from '../transformData'
import { EstimationResult } from '../../types'

export const ApexLineChart: FunctionComponent<ApexLineChartProps> = ({ data }) => {
  const theme = useTheme()

  // We need to get the HTML string version of these icons since ApexCharts doesn't take in custom React components.
  // Why, you might ask? Don't ask me, ask ApexCharts.
  const GetAppIconHTML = renderToStaticMarkup(<GetApp />)
  const PanToolIconHTML = renderToStaticMarkup(<PanTool />)
  const RotateLeftIconHTML = renderToStaticMarkup(<RotateLeft />)
  const ZoomInIconHTML = renderToStaticMarkup(<ZoomIn />)

  const timeSeriesData = transformData(data)
  const options = {
    chart: {
      background: theme.palette.background.default,
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
    colors: getChartColors(theme),
    height: '500px',
    markers: {
      size: 5,
    },
    series: [
      {
        name: 'AWS CO2e',
        data: timeSeriesData,
      },
    ],
    stroke: {
      width: 2,
    },
    theme: {
      mode: theme.palette.type,
    },
    title: {
      text: 'Cloud Emissions (Kgs CO2e)',
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
        formatter: function (value: any, timestamp: any, index: any) {
          return moment.utc(timestamp).format('DD-MMM-YY')
        },
      },
    },
    yaxis: {
      title: {
        text: 'CO2e (kg)',
        offsetX: -8,
        style: {
          fontSize: '15px',
        },
      },
      decimalsInFloat: 5,
    },
  }
  return <Chart options={options} series={options.series} type="line" height={options.height} />
}

type ApexLineChartProps = {
  data: EstimationResult[]
}
