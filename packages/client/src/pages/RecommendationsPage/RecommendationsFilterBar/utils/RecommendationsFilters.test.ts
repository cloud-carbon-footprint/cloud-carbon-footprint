/*
 * © 2021 Thoughtworks, Inc.
 */

import { RecommendationsFilters } from './RecommendationsFilters'
import {
  ALL_DROPDOWN_FILTER_OPTIONS,
  CLOUD_PROVIDER_OPTIONS,
} from 'common/FilterBar/utils/DropdownConstants'

import { DropdownFilterOptions, FilterOptions } from '../../../../Types'
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

  it('should filter recommendations by accounts', () => {
    const rawResults = [
      {
        cloudProvider: 'AWS',
        accountId: 'aws account 1',
        accountName: 'aws account 1',
        region: 'ap-east-1',
        recommendationType: 'Modify',
        instanceName: 'example-instance',
        recommendationDetail: 'Modify instance: example-instance.',
        resourceId: 'i-0f12345678912b12I',
        kilowattHourSavings: 4.978,
        costSavings: 43.506,
        co2eSavings: 0.984,
      },
      {
        cloudProvider: 'AWS',
        accountId: 'aws account 2',
        accountName: 'aws account 2',
        region: 'ap-northeast-2',
        recommendationType: 'Modify',
        instanceName: 'example-instance-2',
        recommendationDetail: 'Modify instance: example-instance-2.',
        resourceId: 'i-0f12345678912b12I',
        kilowattHourSavings: 8.419,
        costSavings: 5.667,
        co2eSavings: 0.288,
      },
    ]

    const defaultConfig = {
      options: {
        accounts: [
          { key: 'aws account 1', name: 'aws account 1', cloudProvider: 'aws' },
          { key: 'aws account 2', name: 'aws account 2', cloudProvider: 'aws' },
        ],
      },
    }

    const filterOptions: FilterOptions = {
      accounts: [
        { key: 'all', name: 'All Accounts', cloudProvider: '' },
        { key: 'aws account 1', name: 'aws account 1', cloudProvider: 'aws' },
        { key: 'aws account 2', name: 'aws account 2', cloudProvider: 'aws' },
      ],
      cloudProviders: CLOUD_PROVIDER_OPTIONS,
    }

    const accountOption = {
      key: 'aws account 1',
      name: 'aws account 1',
      cloudProvider: 'aws',
    }

    const filters = new RecommendationsFilters(
      defaultConfig,
    ).withDropdownOption(
      [accountOption],
      filterOptions,
      DropdownFilterOptions.ACCOUNTS,
    )

    const expectedAccountFiltered = [rawResults[0]]

    expect(filters.filter(rawResults)).toEqual(expectedAccountFiltered)
  })
})
