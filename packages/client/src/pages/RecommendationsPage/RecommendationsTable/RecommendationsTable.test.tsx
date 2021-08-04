/*
 * © 2021 Thoughtworks, Inc.
 */

import { render, within } from '@testing-library/react'
import RecommendationsTable from './RecommendationsTable'
import { RecommendationResult } from '@cloud-carbon-footprint/common'

const mockRecommendations: RecommendationResult[] = [
  {
    cloudProvider: 'AWS',
    accountId: 'test-acc-1',
    accountName: 'test-acc-1',
    region: 'us-west-1',
    recommendationType: 'Modify',
    recommendationDetail: 'Test recommendation detail',
    costSavings: 200,
    co2eSavings: 2.539,
    kilowattHourSavings: 3.2,
  },
  {
    cloudProvider: 'AWS',
    accountId: 'test-acc-1',
    accountName: 'test-acc-2',
    region: 'us-west-2',
    recommendationType: 'Terminate',
    recommendationDetail: 'Test recommendation detail',
    costSavings: 100,
    co2eSavings: 1.24,
    kilowattHourSavings: 6.2,
  },
]

describe('Recommendations Table', () => {
  it('renders a Material UI Table', () => {
    const { getByRole } = render(<RecommendationsTable recommendations={[]} />)
    expect(getByRole('grid')).toBeInTheDocument()
  })

  it('configures the table with appropriate headers', () => {
    const { getByRole } = render(<RecommendationsTable recommendations={[]} />)

    const table = within(getByRole('grid'))

    const expectedHeaders = [
      'Cloud Provider',
      'Account Name',
      'Region',
      'Recommendation Type',
      'Potential Cost Savings ($)',
      'Potential Carbon Savings (metric tons)',
    ]

    expectedHeaders.forEach((header) => {
      expect(table.getByText(header)).toBeInTheDocument()
    })
  })

  it('displays the passed data as the rows for the table', () => {
    const { getAllByRole } = render(
      <RecommendationsTable recommendations={mockRecommendations} />,
    )
    const dataRows = getAllByRole('row')
    dataRows.shift() // Removes first row since it only contains the table headers
    const expectedRowData = mockRecommendations.map((recommendation) =>
      Object.values(recommendation),
    )

    const actualRowData = dataRows.map((row) =>
      within(row).getAllByRole('cell'),
    )

    // Subtracts 3 from the row data length to ignore unused properties
    expect(actualRowData[0].length).toBe(expectedRowData[0].length - 3)
    expect(actualRowData[1].length).toBe(expectedRowData[1].length - 3)
  })
})
