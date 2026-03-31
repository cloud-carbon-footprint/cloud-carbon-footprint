/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Co2eUnit, FilterBarProps } from '../../../Types'
import RecommendationsFilterBar from './RecommendationsFilterBar'

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
