import React, { FunctionComponent } from 'react'
import Chart from 'react-apexcharts'
import { transformData } from './transformData'
import { EstimationResult } from './types'

const options = {
  chart: {
    id: 'apexchart-example',
  },
  xaxis: {
    type: 'datetime',
  },
}

export const ApexLineChart: FunctionComponent<ApexLineChartProps> = ({ data }) => {
  const timeSeriesData = transformData(data)
  return <Chart options={options} series={timeSeriesData} type="line" height={320} />
}

type ApexLineChartProps = {
  data: EstimationResult[]
}
