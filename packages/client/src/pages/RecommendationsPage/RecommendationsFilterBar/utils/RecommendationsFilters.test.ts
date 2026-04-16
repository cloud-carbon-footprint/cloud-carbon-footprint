/*
 * © 2021 Thoughtworks, Inc.
 */

import { RecommendationsFilters } from './RecommendationsFilters'
import {
  ALL_DROPDOWN_FILTER_OPTIONS,
  CLOUD_PROVIDER_OPTIONS,
} from '../../../../common/FilterBar/utils/DropdownConstants'

import { DropdownFilterOptions, FilterOptions } from '../../../../Types'
import { AccountChooser } from './options/AccountChooser'
import { CloudProviderChooser } from './options/CloudProviderChooser'
import { RegionChooser } from './options/RegionChooser'
import { RecommendationTypeChooser } from './options/RecommendationTypeChooser'

describe('Recommendations Filters', () => {
  const defaultConfig = {
    options: {
      accounts: [
        { key: 'aws account 1', name: 'aws account 1', cloudProvider: 'aws' },
        { key: 'gcp account 1', name: 'gcp account 1', cloudProvider: 'gcp' },
        { key: 'gcp account 2', name: 'gcp account 2', cloudProvider: 'gcp' },
      ],
      cloudProviders: [
        { key: 'aws', name: 'AWS' },
        { key: 'gcp', name: 'GCP' },
      ],
      regions: [
        {
          key: 'aws region 1',
          name: 'aws region 1',
          cloudProvider: 'aws',
        },
        {
          key: 'gcp region 1',
          name: 'gcp region 1',
          cloudProvider: 'gcp',
        },
      ],
      recommendationTypes: [
        {
          key: 'delete-image',
          name: 'DELETE_IMAGE',
          cloudProvider: 'gcp',
        },
        {
          key: 'modify',
          name: 'Modify',
          cloudProvider: 'aws',
        },
      ],
    },
  }

  const rawResults = [
    {
      cloudProvider: 'AWS',
      accountId: 'aws account 1',
      accountName: 'aws account 1',
      region: 'aws region 1',
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
      region: 'gcp region 1',
      recommendationType: 'DELETE_IMAGE',
      instanceName: 'example-image-1',
      recommendationDetail: 'Delete image: example-image-1.',
      resourceId: 'i-0f12345678912b12I',
      kilowattHourSavings: 8.419,
      costSavings: 5.667,
      co2eSavings: 0.288,
    },
    {
      cloudProvider: 'GCP',
      accountId: 'gcp account 2',
      accountName: 'gcp account 2',
      region: 'gcp region 1',
      recommendationType: 'SNAPSHOT_AND_DELETE_DISK',
      instanceName: 'example-image-2',
      recommendationDetail: 'Delete instance: example-image-2.',
      resourceId: 'i-0f12345678912b12I',
      kilowattHourSavings: 8.828,
      costSavings: 5.627,
      co2eSavings: 0.372,
    },
  ]

  const emissionsAndRecommendationsData = {
    emissions: [],
    recommendations: rawResults,
  }

  const filterOptions: FilterOptions = {
    accounts: [
      { key: 'all', name: 'All Accounts', cloudProvider: '' },
      { key: 'aws account 1', name: 'aws account 1', cloudProvider: 'aws' },
      { key: 'gcp account 1', name: 'gcp account 1', cloudProvider: 'gcp' },
      { key: 'gcp account 2', name: 'gcp account 2', cloudProvider: 'gcp' },
    ],
    cloudProviders: CLOUD_PROVIDER_OPTIONS,
    regions: [
      { key: 'all', name: 'All Regions', cloudProvider: '' },
      {
        key: 'aws region 1',
        name: 'aws region 1',
        cloudProvider: 'aws',
      },
      {
        key: 'gcp region 1',
        name: 'gcp region 1',
        cloudProvider: 'gcp',
      },
    ],
    recommendationTypes: [
      { key: 'all', name: 'All Recommendation Types', cloudProvider: '' },
      {
        key: 'delete-image',
        name: 'DELETE_IMAGE',
        cloudProvider: 'gcp',
      },
      {
        key: 'modify',
        name: 'Modify',
        cloudProvider: 'aws',
      },
    ],
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
    regions: [
      {
        key: 'us-east-1',
        name: 'US East 1',
        cloudProvider: 'aws',
      },
      {
        key: 'us-west1',
        name: 'US West 1',
        cloudProvider: 'gcp',
      },
    ],
    recommendationTypes: [
      {
        key: 'delete-image',
        name: 'DELETE_IMAGE',
        cloudProvider: 'gcp',
      },
      {
        key: 'modify',
        name: 'Modify',
        cloudProvider: 'aws',
      },
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
      regions: [
        ALL_DROPDOWN_FILTER_OPTIONS.regions,
        ...filteredResultResponse.regions,
      ],
      recommendationTypes: [
        ALL_DROPDOWN_FILTER_OPTIONS.recommendationTypes,
        ...filteredResultResponse.recommendationTypes,
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

    const expectedAccountFiltered = {
      emissions: [],
      recommendations: [rawResults[0]],
    }

    expect(filters.filter(emissionsAndRecommendationsData)).toEqual(
      expectedAccountFiltered,
    )
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

    const expectedAccountFiltered = {
      emissions: [],
      recommendations: [rawResults[0]],
    }

    expect(filters.filter(emissionsAndRecommendationsData)).toEqual(
      expectedAccountFiltered,
    )
  })

  it('should create region chooser', () => {
    const filterType = DropdownFilterOptions.REGIONS
    const selections = [filteredResultResponse.regions[0]]
    const oldSelections = {}
    const filterOptions = {
      regions: [
        ALL_DROPDOWN_FILTER_OPTIONS.regions,
        ...filteredResultResponse.regions,
      ],
    }

    const testFilter = new RecommendationsFilters()

    const expectedChooser = new RegionChooser(
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

  it('should filter recommendations by regions', () => {
    const regionOption = {
      key: 'aws region 1',
      name: 'aws region 1',
      cloudProvider: 'aws',
    }

    const filters = new RecommendationsFilters(
      defaultConfig,
    ).withDropdownOption(
      [regionOption],
      filterOptions,
      DropdownFilterOptions.REGIONS,
    )

    const expectedAccountFiltered = {
      emissions: [],
      recommendations: [rawResults[0]],
    }

    expect(filters.filter(emissionsAndRecommendationsData)).toEqual(
      expectedAccountFiltered,
    )
  })

  it('should create RecommendationType chooser', () => {
    const filterType = DropdownFilterOptions.RECOMMENDATION_TYPES
    const selections = [filteredResultResponse.recommendationTypes[0]]
    const oldSelections = {}
    const filterOptions = {
      recommendationTypes: [
        ALL_DROPDOWN_FILTER_OPTIONS.recommendationTypes,
        ...filteredResultResponse.recommendationTypes,
      ],
    }

    const testFilter = new RecommendationsFilters()

    const expectedChooser = new RecommendationTypeChooser(
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

  it('should filter recommendations by recommendation type', () => {
    const recommendationTypeOption = {
      key: 'delete-image',
      name: 'DELETE_IMAGE',
      cloudProvider: 'gcp',
    }

    const filters = new RecommendationsFilters(
      defaultConfig,
    ).withDropdownOption(
      [recommendationTypeOption],
      filterOptions,
      DropdownFilterOptions.RECOMMENDATION_TYPES,
    )

    const expectedAccountFiltered = {
      emissions: [],
      recommendations: [rawResults[1]],
    }

    expect(filters.filter(emissionsAndRecommendationsData)).toEqual(
      expectedAccountFiltered,
    )
  })

  it('should filter recommendations by multiple recommendation types', () => {
    const recommendationTypeOptions = [
      {
        key: 'delete-image',
        name: 'DELETE_IMAGE',
        cloudProvider: 'gcp',
      },
      {
        key: 'modify',
        name: 'Modify',
        cloudProvider: 'aws',
      },
    ]

    const filters = new RecommendationsFilters(
      defaultConfig,
    ).withDropdownOption(
      recommendationTypeOptions,
      filterOptions,
      DropdownFilterOptions.RECOMMENDATION_TYPES,
    )

    const expectedFiltered = {
      emissions: [],
      recommendations: [rawResults[0], rawResults[1]],
    }

    expect(filters.filter(emissionsAndRecommendationsData)).toEqual(
      expectedFiltered,
    )
  })

  it('should return all recommendations when "All Recommendation Types" is selected', () => {
    const configWithAllOptions = {
      options: {
        accounts: [
          ALL_DROPDOWN_FILTER_OPTIONS.accounts,
          ...defaultConfig.options.accounts,
        ],
        cloudProviders: defaultConfig.options.cloudProviders,
        regions: [
          ALL_DROPDOWN_FILTER_OPTIONS.regions,
          ...defaultConfig.options.regions,
        ],
        recommendationTypes: [
          ALL_DROPDOWN_FILTER_OPTIONS.recommendationTypes,
          ...defaultConfig.options.recommendationTypes,
        ],
      },
    }

    const filters = new RecommendationsFilters(configWithAllOptions)

    expect(filters.filter(emissionsAndRecommendationsData)).toEqual(
      emissionsAndRecommendationsData,
    )
  })

  it('should return empty recommendations when recommendation type matches none', () => {
    const nonMatchingType = {
      key: 'stop-vm',
      name: 'STOP_VM',
      cloudProvider: 'gcp',
    }

    const extendedFilterOptions: FilterOptions = {
      ...filterOptions,
      recommendationTypes: [
        ...filterOptions.recommendationTypes,
        nonMatchingType,
      ],
    }

    const filters = new RecommendationsFilters(
      defaultConfig,
    ).withDropdownOption(
      [nonMatchingType],
      extendedFilterOptions,
      DropdownFilterOptions.RECOMMENDATION_TYPES,
    )

    const expectedFiltered = {
      emissions: [],
      recommendations: [],
    }

    expect(filters.filter(emissionsAndRecommendationsData)).toEqual(
      expectedFiltered,
    )
  })

  it('should generate the correct label for recommendation types when all are selected', () => {
    const allRecommendationTypeOptions = filterOptions.recommendationTypes
    const filters = new RecommendationsFilters({
      options: {
        recommendationTypes: allRecommendationTypeOptions,
      },
    })

    const label = filters.label(
      allRecommendationTypeOptions,
      DropdownFilterOptions.RECOMMENDATION_TYPES,
    )

    expect(label).toEqual('Recommendation Types: 2 of 2')
  })

  it('should generate the correct label for recommendation types when a subset is selected', () => {
    const allRecommendationTypeOptions = filterOptions.recommendationTypes
    const singleSelection = [allRecommendationTypeOptions[1]]

    const filters = new RecommendationsFilters({
      options: {
        recommendationTypes: singleSelection,
      },
    })

    const label = filters.label(
      allRecommendationTypeOptions,
      DropdownFilterOptions.RECOMMENDATION_TYPES,
    )

    expect(label).toEqual('Recommendation Types: 1 of 2')
  })

  it('should filter by recommendation type combined with cloud provider', () => {
    const cloudProviderOption = {
      key: 'gcp',
      name: 'GCP',
    }

    const recommendationTypeOption = {
      key: 'delete-image',
      name: 'DELETE_IMAGE',
      cloudProvider: 'gcp',
    }

    const filters = new RecommendationsFilters(defaultConfig)
      .withDropdownOption(
        [cloudProviderOption],
        filterOptions,
        DropdownFilterOptions.CLOUD_PROVIDERS,
      )
      .withDropdownOption(
        [recommendationTypeOption],
        filterOptions,
        DropdownFilterOptions.RECOMMENDATION_TYPES,
      )

    const expectedFiltered = {
      emissions: [],
      recommendations: [rawResults[1]],
    }

    expect(filters.filter(emissionsAndRecommendationsData)).toEqual(
      expectedFiltered,
    )
  })

  it('should filter by recommendation type combined with account', () => {
    const accountOption = {
      key: 'gcp account 1',
      name: 'gcp account 1',
      cloudProvider: 'gcp',
    }

    const recommendationTypeOption = {
      key: 'delete-image',
      name: 'DELETE_IMAGE',
      cloudProvider: 'gcp',
    }

    const filters = new RecommendationsFilters(defaultConfig)
      .withDropdownOption(
        [accountOption],
        filterOptions,
        DropdownFilterOptions.ACCOUNTS,
      )
      .withDropdownOption(
        [recommendationTypeOption],
        filterOptions,
        DropdownFilterOptions.RECOMMENDATION_TYPES,
      )

    const expectedFiltered = {
      emissions: [],
      recommendations: [rawResults[1]],
    }

    expect(filters.filter(emissionsAndRecommendationsData)).toEqual(
      expectedFiltered,
    )
  })

  it('should filter by recommendation type combined with region', () => {
    const regionOption = {
      key: 'gcp region 1',
      name: 'gcp region 1',
      cloudProvider: 'gcp',
    }

    const recommendationTypeOption = {
      key: 'delete-image',
      name: 'DELETE_IMAGE',
      cloudProvider: 'gcp',
    }

    const filters = new RecommendationsFilters(defaultConfig)
      .withDropdownOption(
        [regionOption],
        filterOptions,
        DropdownFilterOptions.REGIONS,
      )
      .withDropdownOption(
        [recommendationTypeOption],
        filterOptions,
        DropdownFilterOptions.RECOMMENDATION_TYPES,
      )

    const expectedFiltered = {
      emissions: [],
      recommendations: [rawResults[1]],
    }

    expect(filters.filter(emissionsAndRecommendationsData)).toEqual(
      expectedFiltered,
    )
  })

  it('should return empty when recommendation type and account filter exclude each other', () => {
    const configWithMismatch = {
      options: {
        accounts: [
          {
            key: 'aws account 1',
            name: 'aws account 1',
            cloudProvider: 'aws',
          },
        ],
        cloudProviders: defaultConfig.options.cloudProviders,
        regions: [
          ALL_DROPDOWN_FILTER_OPTIONS.regions,
          ...defaultConfig.options.regions,
        ],
        recommendationTypes: [
          {
            key: 'delete-image',
            name: 'DELETE_IMAGE',
            cloudProvider: 'gcp',
          },
        ],
      },
    }

    const filters = new RecommendationsFilters(configWithMismatch)

    const expectedFiltered = {
      emissions: [],
      recommendations: [],
    }

    expect(filters.filter(emissionsAndRecommendationsData)).toEqual(
      expectedFiltered,
    )
  })

  it('should preserve other filter selections when updating recommendation type', () => {
    const accountOption = {
      key: 'aws account 1',
      name: 'aws account 1',
      cloudProvider: 'aws',
    }

    const recommendationTypeOption = {
      key: 'modify',
      name: 'Modify',
      cloudProvider: 'aws',
    }

    const filtersWithAccount = new RecommendationsFilters(
      defaultConfig,
    ).withDropdownOption(
      [accountOption],
      filterOptions,
      DropdownFilterOptions.ACCOUNTS,
    )

    const filtersWithBoth = filtersWithAccount.withDropdownOption(
      [recommendationTypeOption],
      filterOptions,
      DropdownFilterOptions.RECOMMENDATION_TYPES,
    )

    expect(filtersWithBoth.options.recommendationTypes).toEqual([
      recommendationTypeOption,
    ])
    expect(filtersWithBoth.options.accounts).toBeDefined()
  })

  it('should match results with null account name when unknown account option is selected', () => {
    const unknownAccountOption = {
      key: 'unknown',
      name: 'Unknown Account',
      cloudProvider: '',
    }

    const dataWithNullAccount = {
      emissions: [],
      recommendations: [
        {
          cloudProvider: 'AWS',
          accountId: null,
          accountName: null,
          region: 'aws region 1',
          recommendationType: 'Modify',
          instanceName: 'instance-1',
          recommendationDetail: 'Modify instance.',
          resourceId: 'i-abc123',
          kilowattHourSavings: 1.0,
          costSavings: 10.0,
          co2eSavings: 0.5,
        },
      ],
    }

    const configWithUnknown = {
      options: {
        accounts: [unknownAccountOption],
        cloudProviders: defaultConfig.options.cloudProviders,
        regions: [
          ALL_DROPDOWN_FILTER_OPTIONS.regions,
          ...defaultConfig.options.regions,
        ],
        recommendationTypes: [
          ALL_DROPDOWN_FILTER_OPTIONS.recommendationTypes,
          ...defaultConfig.options.recommendationTypes,
        ],
      },
    }

    const filters = new RecommendationsFilters(configWithUnknown)

    expect(filters.filter(dataWithNullAccount)).toEqual(dataWithNullAccount)
  })
})
