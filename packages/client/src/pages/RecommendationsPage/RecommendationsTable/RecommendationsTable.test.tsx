/*
 * © 2021 Thoughtworks, Inc.
 */

import { fireEvent, render, within, screen } from '@testing-library/react'
import each from 'jest-each'
import { mockRecommendationData } from 'utils/data'
import RecommendationsTable from './RecommendationsTable'

describe('Recommendations Table', () => {
  it('renders a Material UI Table', () => {
    const { getByRole } = render(
      <RecommendationsTable recommendations={[]} handleRowClick={jest.fn()} />,
    )
    expect(getByRole('grid')).toBeInTheDocument()
  })

  it('configures the table with appropriate headers', () => {
    const { getByRole } = render(
      <RecommendationsTable recommendations={[]} handleRowClick={jest.fn()} />,
    )

    const table = within(getByRole('grid'))

    const expectedHeaders = [
      'Cloud Provider',
      'Account Name',
      'Region',
      'Recommendation Type',
      'Potential Cost Savings ($)',
      'Potential Carbon Savings (t)',
    ]

    expectedHeaders.forEach((header) => {
      expect(table.getByText(header)).toBeInTheDocument()
    })
  })

  it('displays the passed data as the rows for the table', () => {
    const { getAllByRole } = render(
      <RecommendationsTable
        recommendations={mockRecommendationData}
        handleRowClick={jest.fn()}
      />,
    )
    const dataRows = getAllByRole('row')
    dataRows.shift() // Removes first row since it only contains the table headers
    const expectedRowData = mockRecommendationData.map((recommendation) =>
      Object.values(recommendation),
    )

    const actualRowData = dataRows.map((row) =>
      within(row).getAllByRole('cell'),
    )

    // Subtracts 3 from the row data length to ignore unused properties
    expect(actualRowData[0].length).toBe(expectedRowData[0].length - 5)
    expect(actualRowData[1].length).toBe(expectedRowData[1].length - 5)
  })

  it('calls handle row click with the recommendations details when a row is clicked', () => {
    const handleRowClick = jest.fn()
    render(
      <RecommendationsTable
        recommendations={mockRecommendationData}
        handleRowClick={handleRowClick}
      />,
    )
    fireEvent.click(screen.getByText('test-a'))
    expect(handleRowClick).toHaveBeenCalledTimes(1)
  })

  it('shows undefined cell values as "-" within the table', () => {
    const mockUndefinedRecommendations = [
      {
        cloudProvider: undefined,
        accountId: undefined,
        accountName: undefined,
        region: undefined,
        recommendationType: undefined,
        recommendationDetail: 'Test recommendation detail 1',
        costSavings: undefined,
        co2eSavings: undefined,
        kilowattHourSavings: undefined,
      },
    ]
    const { getAllByRole } = render(
      <RecommendationsTable
        recommendations={mockUndefinedRecommendations}
        handleRowClick={jest.fn()}
      />,
    )

    const dataRows = getAllByRole('row')
    dataRows.shift() // Removes row with table headers

    const actualRowData = dataRows.map((row) =>
      within(row).getAllByRole('cell'),
    )

    actualRowData[0].forEach((cell) => expect(cell.innerHTML).toBe('-'))
  })

  it('toggles CO2 units between metric tons and kilograms', () => {
    const mockRecommendations = [
      {
        cloudProvider: undefined,
        accountId: undefined,
        accountName: undefined,
        region: undefined,
        recommendationType: undefined,
        recommendationDetail: 'Test recommendation detail 1',
        costSavings: undefined,
        co2eSavings: 2.56,
        kilowattHourSavings: undefined,
      },
    ]
    const { getAllByRole, getByRole } = render(
      <RecommendationsTable
        recommendations={mockRecommendations}
        handleRowClick={jest.fn()}
      />,
    )

    const dataRows = getAllByRole('row')
    dataRows.shift() // Removes row with table headers

    const toggle = getByRole('checkbox')

    const actualRowData = dataRows.map((row) =>
      within(row).getAllByRole('cell'),
    )

    const firstRow = actualRowData[0]

    // get last cell for CO2 data
    expect(firstRow[firstRow.length - 1].innerHTML).toBe('2.56')

    fireEvent.click(toggle)

    expect(firstRow[firstRow.length - 1].innerHTML).toBe('2560')

    const table = within(getByRole('grid'))

    expect(table.getByText('Potential Carbon Savings (kg)')).toBeTruthy()
  })

  describe('Search Bar', () => {
    it('should render search bar', () => {
      const { getByTestId } = render(
        <RecommendationsTable
          recommendations={[]}
          handleRowClick={jest.fn()}
        />,
      )

      expect(getByTestId('search-input')).toBeInTheDocument()
    })

    it('should update the search bar', () => {
      const { getByRole } = render(
        <RecommendationsTable
          recommendations={[]}
          handleRowClick={jest.fn()}
        />,
      )

      const searchBar = getByRole('textbox')

      fireEvent.change(searchBar, { target: { value: 'account 1' } })

      expect(searchBar.value).toBe('account 1')
    })

    const searchedRecommendationsRows = [
      ['test-b', true, 1],
      ['AWS', true, 2],
      ['us-west-1', true, 1],
      ['Modify', true, 1],
      [2.539, true, 1],
      ['pizza', undefined, 0],
      [6.2, undefined, 0],
    ]

    each(searchedRecommendationsRows).it(
      'should filter according to search bar value %s',
      (searchValue, expectedResult, rowsLength) => {
        const { getByRole, getAllByRole, getByLabelText } = render(
          <RecommendationsTable
            recommendations={mockRecommendationData}
            handleRowClick={jest.fn()}
          />,
        )

        const searchBar = getByRole('textbox')

        fireEvent.change(searchBar, { target: { value: searchValue } })

        let dataRows = getAllByRole('row')
        dataRows.shift() // Removes row with table headers

        const actualRowData = dataRows.map((row) =>
          within(row).getAllByRole('cell'),
        )

        expect(
          actualRowData[0]?.some((cell) =>
            cell.innerHTML.includes(searchValue),
          ),
        ).toBe(expectedResult)

        expect(actualRowData.length).toEqual(rowsLength)

        const clearButton = getByLabelText('clear search')

        fireEvent.click(clearButton)

        expect(searchBar.value).toBe('')

        dataRows = getAllByRole('row')
        dataRows.shift() // Removes row with table headers

        expect(dataRows.length).toEqual(2)
      },
    )
  })

  describe('Forecast', () => {
    it('should render the forecast component', () => {
      const { getByText } = render(
        <RecommendationsTable
          recommendations={mockRecommendationData}
          handleRowClick={jest.fn()}
        />,
      )

      expect(getByText('Forecast')).toBeInTheDocument()
    })
  })
})
