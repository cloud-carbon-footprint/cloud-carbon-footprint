import React, { FunctionComponent } from 'react'
import Chart from 'react-apexcharts'
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
        text: 'Date',
        offsetY: 8,
        style: {
          fontSize: '15px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Daily co2e',
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
