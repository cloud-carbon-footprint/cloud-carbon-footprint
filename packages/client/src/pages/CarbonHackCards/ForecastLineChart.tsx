import React from 'react'
import ReactApexChart from 'react-apexcharts'

export class ForecastLineChart extends React.Component<
  // eslint-disable-next-line @typescript-eslint/ban-types
  { data: object; categories: object },
  { series: object[]; options: object }
> {
  constructor(props: any) {
    super(props)
    const cropped_data = []
    const cropped_category = []
    let index = 0
    props.data.map((data) => {
      if (index % 4 == 0)
        cropped_data.push((Math.round(data * 100) / 100).toFixed(2))
      index++
    })
    index = 0
    props.categories.map((category) => {
      if (index % 4 == 0) cropped_category.push(new Date(category))
      index++
    })
    this.state = {
      series: [
        {
          data: cropped_data,
        },
      ],
      options: {
        chart: {
          height: 1000,
          type: 'line',
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'straight',
          width: 0.5,
        },
        title: {
          text: '',
          align: 'left',
        },
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: cropped_category.map(
            (category) =>
              category.toString().split(' ')[1] +
              ' ' +
              category.toString().split(' ')[2] +
              '; ' +
              category.toString().split(' ')[4].slice(0, -3),
          ),
          title: {
            text: 'Optimal time',
          },
        },
        yaxis: {
          title: {
            text: 'Emission rating (g/kWh)',
          },
        },
        markers: {
          size: 4,
          fillOpacity: 1,
          shape: 'circle',
        },
      },
    }
  }

  render() {
    return (
      <div id="chart">
        <ReactApexChart
          options={this.state.options}
          series={this.state.series as any}
          type="area"
          height={350}
        />
      </div>
    )
  }
}
