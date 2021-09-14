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
import { CloudProviderChooser } from './options/CloudProviderChooser'

describe('Recommendations Filters', () => {
  const defaultConfig = {
    options: {
      accounts: [
        { key: 'aws account 1', name: 'aws account 1', cloudProvider: 'aws' },
        { key: 'gcp account 1', name: 'gcp account 1', cloudProvider: 'gcp' },
      ],
      cloudProviders: [
        { key: 'aws', name: 'AWS' },
        { key: 'gcp', name: 'GCP' },
      ],
    },
  }

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
      cloudProvider: 'GCP',
      accountId: 'gcp account 1',
      accountName: 'gcp account 1',
      region: 'ap-northeast-2',
      recommendationType: 'CHANGE_MACHINE_TYPE',
      instanceName: 'example-instance-2',
      recommendationDetail: 'Modify instance: example-instance-2.',
      resourceId: 'i-0f12345678912b12I',
      kilowattHourSavings: 8.419,
      costSavings: 5.667,
      co2eSavings: 0.288,
    },
  ]

  const filterOptions: FilterOptions = {
    accounts: [
      { key: 'all', name: 'All Accounts', cloudProvider: '' },
      { key: 'aws account 1', name: 'aws account 1', cloudProvider: 'aws' },
      { key: 'gcp account 1', name: 'gcp account 1', cloudProvider: 'gcp' },
    ],
    cloudProviders: CLOUD_PROVIDER_OPTIONS,
  }

  const filteredResultResponse = {
    accounts: [
      { key: '321321321', name: 'testaccount0', cloudProvider: 'aws' },
      { key: '123123123', name: 'testaccount1', cloudProvider: 'gcp' },
    ],
    cloudProviders: [
      { key: 'aws', name: 'AWS' },
      { key: 'gcp', name: 'GCP' },
    ],
  }

  const expectedConfig = {
    options: {
      accounts: [
        ALL_DROPDOWN_FILTER_OPTIONS.accounts,
        ...filteredResultResponse.accounts,
      ],
      cloudProviders: [
        ALL_DROPDOWN_FILTER_OPTIONS.cloudProviders,
        ...filteredResultResponse.cloudProviders,
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

  it('should create cloud provider chooser', () => {
    const filterType = DropdownFilterOptions.CLOUD_PROVIDERS
    const selections = [filteredResultResponse.cloudProviders[0]]
    const oldSelections = {}
    const filterOptions = {
      cloudProviders: [
        ALL_DROPDOWN_FILTER_OPTIONS.cloudProviders,
        ...filteredResultResponse.cloudProviders,
      ],
    }

    const testFilter = new RecommendationsFilters()

    const expectedChooser = new CloudProviderChooser(
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

  it('should filter recommendations by cloud providers', () => {
    const cloudProviderOption = {
      key: 'aws',
      name: 'AWS',
    }

    const filters = new RecommendationsFilters(
      defaultConfig,
    ).withDropdownOption(
      [cloudProviderOption],
      filterOptions,
      DropdownFilterOptions.CLOUD_PROVIDERS,
    )

    const expectedAccountFiltered = [rawResults[0]]

    expect(filters.filter(rawResults)).toEqual(expectedAccountFiltered)
  })
})
