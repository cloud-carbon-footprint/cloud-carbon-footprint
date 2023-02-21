import React from 'react'
import { render, within } from '@testing-library/react'
import RegionRecommendationCard from './RegionRecommendationCard'
import { mockData } from '../../../utils/data/mockData'
import useRemoteRegionRecommendationService from '../../../utils/hooks/RegionRecommendationServiceHook'
import regionRecomendationMockReturnValue from './RegionRecommendationMockReturnValue'
import { ServiceResult } from '../../../Types'
import { BestLocationData } from '../../../utils/hooks/RegionRecommendationDataHook'
import { BrowserRouter } from 'react-router-dom'

jest.mock('../../../utils/hooks/RegionRecommendationServiceHook')
const mockUseRemoteService =
  useRemoteRegionRecommendationService as jest.MockedFunction<
    typeof useRemoteRegionRecommendationService
  >
describe('RegionRecommendationCard', () => {
  const newMockData = mockData
  newMockData[0].serviceEstimates.push({
    serviceName: 'ebs',
    kilowattHours: 12,
    co2e: 15,
    cost: 5,
    region: 'us-west-1',
    usesAverageCPUConstant: false,
    cloudProvider: 'AWS',
    accountId: 'test-d',
    accountName: 'test-d',
  })
  beforeEach(() => {
    const mockReturnValue = regionRecomendationMockReturnValue

    mockUseRemoteService.mockReturnValue(mockReturnValue)
  })
  it('do not render anything when data is undefined', async () => {
    const { getByRole } = render(<RegionRecommendationCard />)
    const gridElements = within(getByRole('grid'))
    expect(gridElements.getAllByRole('row')).toHaveLength(1)
  })
  it('renders the heading for the region recommendation card', async () => {
    const { getByText } = render(<RegionRecommendationCard data={mockData} />)
    const cardHeading = getByText('Best Location to Shift your Deployment')
    expect(cardHeading).toBeInstanceOf(HTMLElement)
  })
  it('renders the table headings for the region recommendation table', async () => {
    const { getByRole } = render(<RegionRecommendationCard data={mockData} />)
    const tableData = within(getByRole('grid'))
    expect(tableData.getByText('Account')).not.toBeNull()
    expect(tableData.getByText('Region')).not.toBeNull()
    expect(tableData.getByText('Actual Emisssions (Mg)')).not.toBeNull()
    expect(tableData.getByText('Best Location')).not.toBeNull()
    expect(tableData.getByText('Expected Emissions (Mg)')).not.toBeNull()
    expect(tableData.getByText('Reduction in Emissions')).not.toBeNull()
  })
  it('renders the region recommendation data on the region recommendation table', async () => {
    const { getByRole } = render(
      <RegionRecommendationCard data={newMockData} />,
    )
    const gridData = within(getByRole('grid'))
    expect(gridData.getByText('test-a')).not.toBeNull()
    expect(gridData.getByText('test-b')).not.toBeNull()
    expect(gridData.getByText('test-c')).not.toBeNull()
    expect(gridData.getByText('test-d')).not.toBeNull()
  })
  it('should show loading icon if data has not been returned', () => {
    const mockLoading: ServiceResult<BestLocationData[]> = {
      loading: true,
      data: [],
      error: null,
    }
    mockUseRemoteService.mockReturnValue(mockLoading)

    const { getByRole, getByText } = render(
      <RegionRecommendationCard data={newMockData} />,
    )

    expect(getByRole('progressbar')).toBeInTheDocument()
    expect(
      getByText('Loading cloud data. This may take a while...'),
    ).toBeInTheDocument()
  })
  it('should show error icon if data fetching caused an error', () => {
    const mockLoading: ServiceResult<BestLocationData[]> = {
      loading: false,
      data: [],
      error: new Error('Error loading cloud data'),
    }
    mockUseRemoteService.mockReturnValue(mockLoading)

    const { getByTestId } = render(
      <RegionRecommendationCard data={newMockData} />,
      {
        wrapper: BrowserRouter,
      },
    )

    expect(getByTestId('error-message')).toHaveTextContent(
      'Error loading cloud data',
    )
  })
})
