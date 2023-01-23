/*
 * © 2021 Thoughtworks, Inc.
 */

import { fireEvent, render, screen, within } from '@testing-library/react'
import each from 'jest-each'
import moment from 'moment'
import { act } from 'react-dom/test-utils'
import React from 'react'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { Co2eUnit, ServiceResult } from '../../../Types'
import {
  generateEstimations,
  mockData,
  mockRecommendationData,
} from '../../../utils/data'
import RecommendationsTable from './RecommendationsTable'
import { useRemoteFootprintService } from '../../../utils/hooks'

jest.mock('../../../utils/hooks/FootprintServiceHook')

const mockUseRemoteService = useRemoteFootprintService as jest.MockedFunction<
  typeof useRemoteFootprintService
>

const testProps = {
  emissionsData: mockData.flatMap(
    (estimationResult) => estimationResult.serviceEstimates,
  ),
  recommendations: [],
  handleRowClick: jest.fn(),
  co2eUnit: Co2eUnit.MetricTonnes,
}

describe('Recommendations Table', () => {
  let data: EstimationResult[]
  beforeEach(() => {
    data = generateEstimations(moment.utc(), 12)
    const mockReturnValue: ServiceResult<EstimationResult> = {
      loading: false,
      data: data,
      error: null,
    }
    mockUseRemoteService.mockReturnValue(mockReturnValue)
  })

  afterEach(() => {
    mockUseRemoteService.mockClear()
  })

  it('renders a Material UI Table', () => {
    const { getByRole } = render(<RecommendationsTable {...testProps} />)
    expect(getByRole('grid')).toBeInTheDocument()
  })

  it('configures the table with appropriate headers', () => {
    const { getByRole } = render(<RecommendationsTable {...testProps} />)

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
        {...testProps}
        recommendations={mockRecommendationData}
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

  it('displays a selected recommendation in a side panel when its row is clicked', () => {
    const { getByText, queryByTestId } = render(
      <RecommendationsTable
        {...testProps}
        recommendations={mockRecommendationData}
      />,
    )

    expect(queryByTestId('sideBarTitle')).toBeFalsy()

    fireEvent.click(screen.getByText('test-a'))
    const recommendationDetail = getByText(
      mockRecommendationData[0].recommendationDetail,
    )

    expect(queryByTestId('sideBarTitle')).toBeInTheDocument()
    expect(recommendationDetail).toBeInTheDocument()
  })

  it('hides and re-displays the side panel when a recommendation row is clicked multiple times', () => {
    const { getByText, queryByTestId } = render(
      <RecommendationsTable
        {...testProps}
        recommendations={mockRecommendationData}
      />,
    )

    fireEvent.click(screen.getByText('test-a'))
    fireEvent.click(screen.getByText('test-a', { selector: 'div' }))
    // selector added because now there are multiple elements with the text 'test-a' on the screen

    expect(queryByTestId('sideBarTitle')).toBeFalsy()

    fireEvent.click(screen.getByText('test-a'))
    const recommendationDetail = getByText(
      mockRecommendationData[0].recommendationDetail,
    )

    expect(queryByTestId('sideBarTitle')).toBeInTheDocument()
    expect(recommendationDetail).toBeInTheDocument()
  })

  it('displays a new recommendation in the side panel when its recommendation row is clicked', () => {
    const { getByText, queryByText, queryByTestId } = render(
      <RecommendationsTable
        {...testProps}
        recommendations={mockRecommendationData}
      />,
    )

    fireEvent.click(screen.getByText('test-a'))
    fireEvent.click(screen.getByText('test-b'))
    const firstRecommendationDetail = queryByText(
      mockRecommendationData[0].recommendationDetail,
    )
    const secondRecommendationDetail = getByText(
      mockRecommendationData[1].recommendationDetail,
    )

    expect(queryByTestId('sideBarTitle')).toBeInTheDocument()
    expect(firstRecommendationDetail).toBeFalsy()
    expect(secondRecommendationDetail).toBeInTheDocument()
  })

  it('re-displays the side panel when the close button and then the same recommendation row is clicked', () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <RecommendationsTable
        {...testProps}
        recommendations={mockRecommendationData}
      />,
    )

    fireEvent.click(screen.getByText('test-a'))

    const closeIcon = getByTestId('closeIcon')

    act(() => {
      fireEvent.click(closeIcon)
    })

    fireEvent.click(screen.getByText('test-a'))
    const recommendationDetail = getByText(
      mockRecommendationData[0].recommendationDetail,
    )

    expect(queryByTestId('sideBarTitle')).toBeInTheDocument()
    expect(recommendationDetail).toBeInTheDocument()
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
        costSavings: null,
        co2eSavings: null,
        kilowattHourSavings: null,
      },
    ]
    const { getAllByRole } = render(
      <RecommendationsTable
        {...testProps}
        recommendations={mockUndefinedRecommendations}
      />,
    )

    const dataRows = getAllByRole('row')
    dataRows.shift() // Removes row with table headers

    const actualRowData = dataRows.map((row) =>
      within(row).getAllByRole('cell'),
    )

    actualRowData[0].forEach((cell) => expect(cell.innerHTML).toContain('-'))
  })

  const co2eSavingsToBeRounded = [
    [0.01, '0.01'],
    [0.001, '0.001'],
    [0.0005, '0.001'],
    [0.0001, '< 0.001'],
    [0.00001, '< 0.001'],
    [0.000001, '< 0.001'],
    [0.0000001, '< 0.001'],
  ]

  each(co2eSavingsToBeRounded).it(
    'rounds savings to nearest 0.001 - val %s',
    (savings, roundedSavings) => {
      const { getAllByRole } = render(
        <RecommendationsTable
          {...testProps}
          recommendations={[
            {
              cloudProvider: undefined,
              accountId: undefined,
              accountName: undefined,
              region: undefined,
              recommendationType: undefined,
              recommendationDetail: undefined,
              costSavings: null,
              co2eSavings: savings,
              kilowattHourSavings: null,
            },
          ]}
          co2eUnit={Co2eUnit.MetricTonnes}
        />,
      )

      const dataRows = getAllByRole('row')
      dataRows.shift() // Removes row with table headers

      const actualRowData = dataRows.map((row) =>
        within(row).getAllByRole('cell'),
      )

      const firstRow = actualRowData[0]

      // get last cell for CO2 data
      expect(firstRow[firstRow.length - 1].textContent).toBe(roundedSavings)
    },
  )

  const co2eSavingsToBeRoundedInKilograms = [
    [0.01, '10'],
    [0.001, '1'],
    [0.0005, '0.5'],
    [0.0001, '0.1'],
    [0.00001, '0.01'],
    [0.000001, '0.001'],
    [0.0000001, '< 0.001'],
  ]

  each(co2eSavingsToBeRoundedInKilograms).it(
    'rounds savings in kg to nearest 0.001 - val %s',
    (savings, roundedSavingsInKilograms) => {
      const { getAllByRole } = render(
        <RecommendationsTable
          {...testProps}
          recommendations={[
            {
              cloudProvider: undefined,
              accountId: undefined,
              accountName: undefined,
              region: undefined,
              recommendationType: undefined,
              recommendationDetail: undefined,
              costSavings: null,
              co2eSavings: savings,
              kilowattHourSavings: null,
            },
          ]}
          co2eUnit={Co2eUnit.Kilograms}
        />,
      )

      const dataRows = getAllByRole('row')
      dataRows.shift() // Removes row with table headers

      const actualRowData = dataRows.map((row) =>
        within(row).getAllByRole('cell'),
      )

      const firstRow = actualRowData[0]

      // get last cell for CO2 data
      expect(firstRow[firstRow.length - 1].textContent).toBe(
        roundedSavingsInKilograms,
      )
    },
  )

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
        {...testProps}
        recommendations={mockRecommendations}
        co2eUnit={Co2eUnit.Kilograms}
      />,
    )

    const dataRows = getAllByRole('row')
    dataRows.shift() // Removes row with table headers

    const actualRowData = dataRows.map((row) =>
      within(row).getAllByRole('cell'),
    )

    const firstRow = actualRowData[0]

    expect(firstRow[firstRow.length - 1].innerHTML).toBe('2560')

    const table = within(getByRole('grid'))

    expect(table.getByText('Potential Carbon Savings (kg)')).toBeTruthy()
  })

  it('should display message when table is empty', () => {
    const { getByRole } = render(
      <RecommendationsTable
        {...testProps}
        recommendations={mockRecommendationData}
      />,
    )
    const dataGrid = within(getByRole('grid'))
    const searchBar = getByRole('textbox')

    const emptyGridMessage =
      "There's no data to display! Expand your search parameters to get started. (Try adding accounts, regions or recommendation types)"
    expect(dataGrid.queryByText(emptyGridMessage)).not.toBeInTheDocument()

    fireEvent.change(searchBar, {
      target: { value: 'should filter everything out' },
    })
    expect(dataGrid.queryByText(emptyGridMessage)).toBeInTheDocument()
  })

  describe('Search Bar', () => {
    it('should render search bar', () => {
      const { getByTestId } = render(<RecommendationsTable {...testProps} />)

      expect(getByTestId('search-input')).toBeInTheDocument()
    })

    it('should update the search bar', () => {
      const { getByRole } = render(<RecommendationsTable {...testProps} />)

      const searchBar = getByRole('textbox') as HTMLInputElement

      fireEvent.change(searchBar, { target: { value: 'account 1' } })

      expect(searchBar.value).toBe('account 1')
    })

    const searchedRecommendationsRows = [
      ['test-b', true, 1, Co2eUnit.MetricTonnes],
      ['AWS', true, 2, Co2eUnit.MetricTonnes],
      ['us-west-1', true, 1, Co2eUnit.MetricTonnes],
      ['Modify', true, 1, Co2eUnit.MetricTonnes],
      [2.539, true, 1, Co2eUnit.MetricTonnes],
      [2539, true, 1, Co2eUnit.Kilograms],
      ['pizza', undefined, 0, Co2eUnit.MetricTonnes],
      [6.2, undefined, 0, Co2eUnit.MetricTonnes],
    ]

    each(searchedRecommendationsRows).it(
      'should filter according to search bar value %s',
      (searchValue, expectedResult, rowsLength, co2eUnit) => {
        const { getByRole, getAllByRole, getByLabelText } = render(
          <RecommendationsTable
            {...testProps}
            recommendations={mockRecommendationData}
            co2eUnit={co2eUnit}
          />,
        )

        const searchBar = getByRole('textbox') as HTMLInputElement

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
          {...testProps}
          recommendations={mockRecommendationData}
        />,
      )

      expect(getByText('Forecast')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    const mockRecommendationsFor2Pages = [...mockRecommendationData]

    // Build duplicate recommendations for multiple pages
    for (let i = 0; i < 27; i++) {
      mockRecommendationsFor2Pages.push({
        cloudProvider: 'AWS',
        accountId: 'account ' + i,
        accountName: 'account ' + i,
        region: 'us-west-2',
        recommendationType: 'Terminate',
        recommendationDetail: 'Test recommendation detail 2',
        costSavings: 100,
        co2eSavings: 1.24,
        kilowattHourSavings: 6.2,
        instanceName: 'test-instance',
        resourceId: 'test-resource-id',
      })
    }

    it('should reset to first page when table data is changed', () => {
      const { getAllByLabelText } = render(
        <RecommendationsTable
          {...testProps}
          recommendations={mockRecommendationsFor2Pages}
        />,
      )
      const activePageStyle = 'backgroundColor: #3f51b5'

      // Only check buttons in first pagination instance
      expect(getAllByLabelText('page 1')[0]).toHaveStyle(activePageStyle)

      const nextPageButton = getAllByLabelText('Go to page 2')[0]
      fireEvent.click(nextPageButton)

      expect(getAllByLabelText('page 2')[0]).toHaveStyle(activePageStyle)
      expect(getAllByLabelText('Go to page 1')[0]).not.toHaveStyle(
        activePageStyle,
      )

      // Get first sort button
      const sortButton = getAllByLabelText('Sort')[0]
      fireEvent.click(sortButton)

      expect(getAllByLabelText('Go to page 2')[0]).not.toHaveStyle(
        activePageStyle,
      )
      expect(getAllByLabelText('page 1')[0]).toHaveStyle(activePageStyle)
    })

    it('should reset to page 1 after search, filters, and sorting are applied', () => {
      const { getByRole, getAllByLabelText } = render(
        <RecommendationsTable
          {...testProps}
          recommendations={mockRecommendationsFor2Pages}
        />,
      )

      const activePageStyle = 'backgroundColor: #3f51b5'

      // Only check buttons in first pagination instance
      expect(getAllByLabelText('page 1')[0]).toHaveStyle(activePageStyle)

      const nextPageButton = getAllByLabelText('Go to page 2')[0]
      fireEvent.click(nextPageButton)

      expect(getAllByLabelText('page 2')[0]).toHaveStyle(activePageStyle)
      expect(getAllByLabelText('Go to page 1')[0]).not.toHaveStyle(
        activePageStyle,
      )

      //change value of the search bar
      const searchBar = getByRole('textbox')
      fireEvent.change(searchBar, { target: { value: 'aws' } })

      expect(getAllByLabelText('Go to page 2')[0]).not.toHaveStyle(
        activePageStyle,
      )
      expect(getAllByLabelText('page 1')[0]).toHaveStyle(activePageStyle)
    })
  })
})
