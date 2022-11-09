import React from 'react'
import { render, within } from '@testing-library/react'
import ForecastCard from './ForecastCard'
import { mockData } from '../../../utils/data/mockData'
import useRemoteForecastService from '../../../utils/hooks/ForecastServiceHook'
import { forecastServiceMockReturnValue } from './ForecastCardMockData'

jest.mock('../../../utils/hooks/ForecastServiceHook')
const mockUseRemoteService = useRemoteForecastService as jest.MockedFunction<
  typeof useRemoteForecastService
>
xdescribe('ForecastCard', () => {
  beforeEach(() => {
    mockUseRemoteService.mockReturnValue(forecastServiceMockReturnValue)
  })
  it('do not render anything when data is undefined', async () => {
    const { getByRole } = render(<ForecastCard />)
    const tableElements = within(getByRole('table'))
    expect(tableElements.getAllByRole('row')).toHaveLength(1)
  })
  it('renders the heading for the forecast card', async () => {
    const { getByText } = render(<ForecastCard data={mockData} />)
    const cardHeading = getByText('Optimal Time to Schedule your Workloads')
    expect(cardHeading).toBeInstanceOf(HTMLElement)
  })
  it('renders the table headings for the forecast table', async () => {
    const { getByRole } = render(<ForecastCard data={mockData} />)
    const tableData = within(getByRole('table'))
    expect(tableData.getByText('Account')).not.toBeNull()
    expect(tableData.getByText('Region')).not.toBeNull()
    expect(tableData.getByText('Date')).not.toBeNull()
    expect(tableData.getByText('Time')).not.toBeNull()
    expect(tableData.getByText('Rating (g/kWh)')).not.toBeNull()
    expect(tableData.getByText('More Info')).not.toBeNull()
  })
  it('renders the region recommendation data on the region recommendation table', async () => {
    const { getByRole } = render(<ForecastCard data={mockData} />)
    const tableData = within(getByRole('table'))
    expect(tableData.getByText('test-a')).not.toBeNull()
    expect(tableData.getByText('test-b')).not.toBeNull()
    expect(tableData.getByText('test-c')).not.toBeNull()
    expect(tableData.getByText('test-d')).not.toBeNull()
  })
})
