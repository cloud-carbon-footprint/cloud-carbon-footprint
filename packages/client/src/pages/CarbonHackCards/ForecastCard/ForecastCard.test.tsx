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
describe('ForecastCard', () => {
  beforeEach(() => {
    mockUseRemoteService.mockReturnValue(forecastServiceMockReturnValue)
  })
  it('do not render anything when data is undefined', async () => {
    const { getByRole } = render(<ForecastCard />)
    const gridElements = within(getByRole('grid'))
    expect(gridElements.getAllByRole('row')).toHaveLength(1)
  })
  it('renders the heading for the forecast card', async () => {
    const { getByText } = render(<ForecastCard data={mockData} />)
    const cardHeading = getByText('Optimal Time to Schedule your Workloads')
    expect(cardHeading).toBeInstanceOf(HTMLElement)
  })
  it('renders the table headings for the forecast table', async () => {
    const { getByRole } = render(<ForecastCard data={mockData} />)
    const gridData = within(getByRole('grid'))
    expect(gridData.getByText('Account')).not.toBeNull()
    expect(gridData.getByText('Region')).not.toBeNull()
    expect(gridData.getByText('Date')).not.toBeNull()
    expect(gridData.getByText('Rating (g/kWh)')).not.toBeNull()
    expect(gridData.getByText('More Info')).not.toBeNull()
  })
  it('renders the forecast data on the forecast table', async () => {
    const { getByRole } = render(<ForecastCard data={mockData} />)
    const gridData = within(getByRole('grid'))
    expect(gridData.getByText('test-a')).not.toBeNull()
    expect(gridData.getByText('test-b')).not.toBeNull()
    expect(gridData.getByText('test-c')).not.toBeNull()
  })
  it('renders the line chart dialogs for all accounts on the forecast table', async () => {
    const { getAllByTestId } = render(<ForecastCard data={mockData} />)
    const lineCharts = getAllByTestId('line-chart-dialog')
    expect(lineCharts).toHaveLength(3)
  })
})
