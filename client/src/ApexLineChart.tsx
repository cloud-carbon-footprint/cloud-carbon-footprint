import React, { FunctionComponent } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Chart from 'react-apexcharts'
import { GetApp, PanTool, RotateLeft, ZoomIn } from '@material-ui/icons'
import moment from 'moment'

import { transformData } from './transformData'
import { EstimationResult } from './types'

export const ApexLineChart: FunctionComponent<ApexLineChartProps> = ({ data }) => {
  // We need to get the HTML string version of these icons since ApexCharts doesn't take in custom React components.
  // Why, you might ask? Don't ask me, ask ApexCharts.
  const GetAppIconHTML = renderToStaticMarkup(<GetApp />)
  const PanToolIconHTML = renderToStaticMarkup(<PanTool />)
  const RotateLeftIconHTML = renderToStaticMarkup(<RotateLeft />)
  const ZoomInIconHTML = renderToStaticMarkup(<ZoomIn />)

  const timeSeriesData = transformData(data)
  const options = {
    series: [
      {
        name: 'AWS CO2e',
        data: timeSeriesData,
      },
    ],
    chart: {
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
    height: '500px',
    markers: {
      size: 5,
    },
    stroke: {
      width: 2,
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
