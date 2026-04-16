/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { fireEvent, act, render } from '@testing-library/react'
import { Co2eUnit, FilterBarProps, FilterOptions } from '../../../Types'
import RecommendationsFilterBar from './RecommendationsFilterBar'
import RecommendationTypeFilter from './Filters/RecommendationType'
import RegionFilter from './Filters/RegionFilter'
import { RecommendationsFilters } from './utils/RecommendationsFilters'
import {
  ALL_DROPDOWN_FILTER_OPTIONS,
  CLOUD_PROVIDER_OPTIONS,
} from '../../../common/FilterBar/utils/DropdownConstants'

type MockFilterBarProps = {
  config: {
    filterOptions: {
      accounts: Array<{ key: string }>
      regions: Array<{ key: string }>
      recommendationTypes: Array<{ key: string }>
    }
  }
  suffixComponent?: React.ReactNode
}

const mockFilterBar = jest.fn(({ suffixComponent }: MockFilterBarProps) => (
  <div data-testid="recommendations-filter-bar">{suffixComponent}</div>
))

jest.mock('../../../common/FilterBar', () => ({
  __esModule: true,
  default: (props: MockFilterBarProps) => mockFilterBar(props),
}))

jest.mock('../../../common/Toggle', () => ({
  __esModule: true,
  default: ({ handleToggle }: { handleToggle: (checked: boolean) => void }) => (
    <div>
      <button type="button" onClick={() => handleToggle(true)}>
        kg
      </button>
      <button type="button" onClick={() => handleToggle(false)}>
        mt
      </button>
    </div>
  ),
}))

describe('RecommendationsFilterBar', () => {
  const defaultProps: FilterBarProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters: {} as any,
    setFilters: jest.fn(),
    setCo2eUnit: jest.fn(),
    filterOptions: {
      accounts: [{ key: 'acct', name: 'acct', cloudProvider: 'AWS' }],
      cloudProviders: [{ key: 'aws', name: 'AWS', cloudProvider: 'AWS' }],
      recommendationTypes: [
        { key: 'rightsize', name: 'rightsize', cloudProvider: 'AWS' },
      ],
      regions: [{ key: 'us-east-1', name: 'us-east-1', cloudProvider: 'AWS' }],
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('maps toggle true to kilograms and false to metric tonnes', () => {
    const setCo2eUnit = jest.fn()
    render(
      <RecommendationsFilterBar {...defaultProps} setCo2eUnit={setCo2eUnit} />,
    )

    const suffixComponent = mockFilterBar.mock.calls[0][0].suffixComponent
    suffixComponent.props.handleToggle(true)
    suffixComponent.props.handleToggle(false)

    expect(setCo2eUnit).toHaveBeenNthCalledWith(1, Co2eUnit.Kilograms)
    expect(setCo2eUnit).toHaveBeenNthCalledWith(2, Co2eUnit.MetricTonnes)
  })

  it('builds filter options even when incoming options are undefined', () => {
    render(
      <RecommendationsFilterBar {...defaultProps} filterOptions={undefined} />,
    )

    expect(mockFilterBar).toHaveBeenCalledTimes(1)
    const config = mockFilterBar.mock.calls[0][0].config
    expect(config.filterOptions.accounts[0].key).toEqual('all')
    expect(config.filterOptions.regions[0].key).toEqual('all')
    expect(config.filterOptions.recommendationTypes[0].key).toEqual('all')
  })
})

describe('RecommendationTypeFilter', () => {
  const recType = {
    key: 'delete-image',
    name: 'DELETE_IMAGE',
    cloudProvider: 'gcp',
  }

  const filterOptions: FilterOptions = {
    accounts: [ALL_DROPDOWN_FILTER_OPTIONS.accounts],
    cloudProviders: CLOUD_PROVIDER_OPTIONS,
    regions: [ALL_DROPDOWN_FILTER_OPTIONS.regions],
    recommendationTypes: [
      ALL_DROPDOWN_FILTER_OPTIONS.recommendationTypes,
      recType,
    ],
  }

  const filtersConfig = RecommendationsFilters.generateConfig({
    accounts: [],
    recommendationTypes: [recType],
    regions: [],
  })

  it('calls setFilters when a recommendation type is selected', () => {
    const mockFilters = new RecommendationsFilters(filtersConfig)
    const setFilters = jest.fn()

    const { getByLabelText, getByText } = render(
      <RecommendationTypeFilter
        filters={mockFilters}
        setFilters={setFilters}
        options={filterOptions}
      />,
    )

    act(() => {
      fireEvent.click(getByLabelText('Open'))
    })

    act(() => {
      fireEvent.click(getByText('DELETE_IMAGE'))
    })

    expect(setFilters).toHaveBeenCalledTimes(1)
    expect(setFilters).toHaveBeenCalledWith(expect.any(RecommendationsFilters))
  })
})

describe('RegionFilter', () => {
  const region = {
    key: 'us-east-1',
    name: 'US East 1',
    cloudProvider: 'aws',
  }

  const filterOptions: FilterOptions = {
    accounts: [ALL_DROPDOWN_FILTER_OPTIONS.accounts],
    cloudProviders: CLOUD_PROVIDER_OPTIONS,
    regions: [ALL_DROPDOWN_FILTER_OPTIONS.regions, region],
    recommendationTypes: [ALL_DROPDOWN_FILTER_OPTIONS.recommendationTypes],
  }

  const filtersConfig = RecommendationsFilters.generateConfig({
    accounts: [],
    regions: [region],
    recommendationTypes: [],
  })

  it('calls setFilters when a region is selected', () => {
    const mockFilters = new RecommendationsFilters(filtersConfig)
    const setFilters = jest.fn()

    const { getByLabelText, getByText } = render(
      <RegionFilter
        filters={mockFilters}
        setFilters={setFilters}
        options={filterOptions}
      />,
    )

    act(() => {
      fireEvent.click(getByLabelText('Open'))
    })

    act(() => {
      fireEvent.click(getByText('US East 1'))
    })

    expect(setFilters).toHaveBeenCalledTimes(1)
    expect(setFilters).toHaveBeenCalledWith(expect.any(RecommendationsFilters))
  })
})
