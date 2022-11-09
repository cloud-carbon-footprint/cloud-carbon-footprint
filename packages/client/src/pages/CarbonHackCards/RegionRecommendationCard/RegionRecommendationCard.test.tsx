import React from 'react'
import { render, within } from '@testing-library/react'
import RegionRecommendationCard from './RegionRecommendationCard'
import { mockData } from '../../../utils/data/mockData'
import useRemoteRegionRecommendationService from '../../../utils/hooks/RegionRecommendationServiceHook'
import regionRecomendationMockReturnValue from './RegionRecommendationMockReturnValue'

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
    const tableElements = within(getByRole('table'))
    expect(tableElements.getAllByRole('row')).toHaveLength(1)
  })
  it('renders the heading for the region recommendation card', async () => {
    const { getByText } = render(<RegionRecommendationCard data={mockData} />)
    const cardHeading = getByText(
      'Best Location to Shift your Deployed Location',
    )
    expect(cardHeading).toBeInstanceOf(HTMLElement)
  })
  it('renders the table headings for the region recommendation table', async () => {
    const { getByRole } = render(<RegionRecommendationCard data={mockData} />)
    const tableData = within(getByRole('table'))
    expect(tableData.getByText('Account')).not.toBeNull()
    expect(tableData.getByText('Region')).not.toBeNull()
    expect(tableData.getByText('Actual Emissions (Mg)')).not.toBeNull()
    expect(tableData.getByText('Best Location')).not.toBeNull()
    expect(tableData.getByText('Expected Emissions (Mg)')).not.toBeNull()
    expect(tableData.getByText('Reduction in Emissions')).not.toBeNull()
  })
  it('renders the region recommendation data on the region recommendation table', async () => {
    const { getByRole } = render(
      <RegionRecommendationCard data={newMockData} />,
    )
    const tableData = within(getByRole('table'))
    expect(tableData.getByText('test-a')).not.toBeNull()
    expect(tableData.getByText('test-b')).not.toBeNull()
    expect(tableData.getByText('test-c')).not.toBeNull()
    expect(tableData.getByText('test-d')).not.toBeNull()
  })
})
