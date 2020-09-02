import React, { FunctionComponent } from 'react'
import Chart from 'react-apexcharts'
import moment from 'moment'

import { transformData } from './transformData'
import { EstimationResult } from './types'

export const ApexLineChart: FunctionComponent<ApexLineChartProps> = ({ data }) => {
  const timeSeriesData = transformData(data)
  const options = {
    series: [
      {
        name: 'co2e',
        data: timeSeriesData,
      },
    ],
    chart: {
      id: 'apexchart-example',
      toolbar: {
        tools: {
          zoomin: false,
          zoomout: false,
          customIcons: [],
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
      text: 'Cloud Emissions',
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
          return moment(new Date(timestamp)).format('DD-MMM-YY')
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
    },
  }
  return <Chart options={options} series={options.series} type="line" height={options.height} />
}

type ApexLineChartProps = {
  data: EstimationResult[]
}
