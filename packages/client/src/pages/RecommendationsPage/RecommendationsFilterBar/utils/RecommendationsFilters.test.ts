/*
 * © 2021 Thoughtworks, Inc.
 */

import { RecommendationsFilters } from './RecommendationsFilters'
import { ALL_DROPDOWN_FILTER_OPTIONS } from 'common/FilterBar/utils/DropdownConstants'

import { DropdownFilterOptions } from '../../../../Types'
import { AccountChooser } from './options/AccountChooser'

describe('Recommendations Filters', () => {
  const filteredResultResponse = {
    accounts: [
      { key: '321321321', name: 'testaccount0', cloudProvider: 'aws' },
      { key: '123123123', name: 'testaccount1', cloudProvider: 'gcp' },
    ],
  }

  const expectedConfig = {
    options: {
      accounts: [
        ALL_DROPDOWN_FILTER_OPTIONS.accounts,
        ...filteredResultResponse.accounts,
      ],
    },
  }

  it('should generate filter config', () => {
    const generatedConfig = RecommendationsFilters.generateConfig(
      filteredResultResponse,
    )

    expect(generatedConfig).toEqual(expectedConfig)
  })

  it('should create a new Recommendations filter with the specified filters config', () => {
    const testFilter = new RecommendationsFilters()

    const expectedFilter = new RecommendationsFilters(expectedConfig)

    expect(testFilter.create(expectedConfig)).toEqual(expectedFilter)
  })

  it('should create accounts chooser', () => {
    const filterType = DropdownFilterOptions.ACCOUNTS
    const selections = [filteredResultResponse.accounts[0]]
    const oldSelections = {}
    const filterOptions = {
      accounts: [
        ALL_DROPDOWN_FILTER_OPTIONS.accounts,
        ...filteredResultResponse.accounts,
      ],
    }

    const testFilter = new RecommendationsFilters()

    const expectedChooser = new AccountChooser(
      selections,
      oldSelections,
      filterOptions,
    )

    console.log(expectedChooser)

    expect(
      JSON.stringify(
        testFilter.createOptionChooser(
          filterType,
          selections,
          oldSelections,
          filterOptions,
        ),
      ),
    ).toEqual(JSON.stringify(expectedChooser))
  })
})
