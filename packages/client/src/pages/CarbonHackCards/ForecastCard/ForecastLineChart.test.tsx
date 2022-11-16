/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react'
import { create } from 'react-test-renderer'
import { ForecastLineChart } from './ForecastLineChart'
import { data, categories } from './ForecastLineChartMockData'

jest.mock('react-apexcharts')

describe('ForecastLineChart', () => {
  it('renders line chart', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const root = create(
      <ForecastLineChart data={data} categories={categories} />,
    )
    expect(root.toJSON()).toMatchSnapshot()
  })
})
