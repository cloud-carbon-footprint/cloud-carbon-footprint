import { fireEvent, render, within } from '@testing-library/react'
import React from 'react'
import { create } from 'react-test-renderer'
import LineChartDialog from './LineChartDialog'

jest.mock('./ForecastLineChart')

describe('LineChartDialog', () => {
  const mockInputData = [
    {
      duration: 60,
      location: 'CAISO_NORTH',
      timestamp: '2022-11-09T07:25:00+00:00',
      value: 435.0320147282777,
    },
    {
      duration: 60,
      location: 'CAISO_NORTH',
      timestamp: '2022-11-09T07:30:00+00:00',
      value: 435.07368308252774,
    },
    {
      duration: 60,
      location: 'CAISO_NORTH',
      timestamp: '2022-11-09T07:35:00+00:00',
      value: 435.1770568685555,
    },
  ]

  it('renders line chart dialog', async () => {
    const root = create(
      <LineChartDialog forecastData={mockInputData} region={'us-west-1'} />,
    )
    expect(root.toJSON()).toMatchSnapshot()
  })
  it('renders title of the dialog', async () => {
    const { getByTestId, findByText } = render(
      <LineChartDialog forecastData={mockInputData} region={'us-west-1'} />,
    )
    fireEvent.click(getByTestId('info-icon'))
    const title = within(await findByText('Forecast for us-west-1'))
    expect(title).not.toBeNull()
  })
})
