import { sumCO2ByService } from './transformData'
import Chart from 'react-apexcharts'
import React, { FunctionComponent } from 'react'
import { EstimationResult } from './types'

export const ApexDonutChart: FunctionComponent<ApexDonutChartProps> = ({ data }) => {
  const donutData = sumCO2ByService(data)

  const options = {
    height: '500px',
    labels: Object.keys(donutData),
    legend: {
      position: 'top',
      offsetY: -8,
    },
    series: Object.values(donutData),
    title: {
      text: 'Carbon Emissions by Service',
      offsetY: -8,
      style: {
        fontSize: '24px',
      },
    },
    width: '100%',
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: function (value: string) {
          return `${value} kg CO2e`
        },
      },
    },
  }
  return <Chart options={options} series={options.series} type="donut" width={options.width} />
}

type ApexDonutChartProps = {
  data: EstimationResult[]
}
