/*
 * © 2021 Thoughtworks, Inc.
 */
import * as FiltersUtil from './FiltersUtil'
import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import {
  ALL_CLOUD_PROVIDERS_VALUE,
  ALL_SERVICES_VALUE,
  CLOUD_PROVIDER_OPTIONS,
} from './DropdownConstants'
import { EmissionsFilters } from '../../../pages/EmissionsMetricsPage/EmissionsFilterBar/utils/EmissionsFilters'

jest.mock('ConfigLoader', () => {
  return jest.fn().mockImplementation(() => {
    return {
      CURRENT_PROVIDERS: [
        { key: 'aws', name: 'AWS' },
        { key: 'gcp', name: 'GCP' },
      ],
    }
  })
})

describe('filterUtil', () => {
  const ALL_STRING = 'all'
  const ebsServiceOption = {
    key: 'ebs',
    name: 'EBS',
    cloudProvider: 'aws',
  }
  const s3ServiceOption = {
    key: 's3',
    name: 'S3',
    cloudProvider: 'aws',
  }
  const ec2ServiceOption = {
    key: 'ec2',
    name: 'EC2',
    cloudProvider: 'aws',
  }
  const elastiCacheServiceOption = {
    key: 'elasticache',
    name: 'ElastiCache',
    cloudProvider: 'aws',
  }
  const rdsServiceOption = {
    key: 'rds',
    name: 'RDS',
    cloudProvider: 'aws',
  }
  const lambdaServiceOption = {
    key: 'lambda',
    name: 'Lambda',
    cloudProvider: 'aws',
  }
  const computeEngineServiceOption = {
    key: 'computeEngine',
    name: 'Compute Engine',
    cloudProvider: 'gcp',
  }

  const awsServiceOptions: DropdownOption[] = [
    ebsServiceOption,
    ec2ServiceOption,
    elastiCacheServiceOption,
    lambdaServiceOption,
    rdsServiceOption,
    s3ServiceOption,
  ]
  const allServiceOption = { key: ALL_STRING, name: ALL_SERVICES_VALUE }
  const allServiceOptions: DropdownOption[] = [
    allServiceOption,
    ...awsServiceOptions,
    computeEngineServiceOption,
  ]
  const awsProviderOption = { key: 'aws', name: 'AWS' }
  const gcpProviderOption = { key: 'gcp', name: 'GCP' }
  const allProviderOption = { key: ALL_STRING, name: ALL_CLOUD_PROVIDERS_VALUE }
  const allProviderOptions = [
    allProviderOption,
    awsProviderOption,
    gcpProviderOption,
  ]
  const awsAccountOptions = [
    { key: '321321321', name: 'testaccount0', cloudProvider: 'aws' },
    { key: '321321322', name: 'testaccount1', cloudProvider: 'aws' },
  ]
  const gcpAccountOptions = [
    { key: '123123123', name: 'testaccount2', cloudProvider: 'gcp' },
    { key: '123412341', name: 'testaccount3', cloudProvider: 'gcp' },
  ]
  const allAccountOption = {
    key: ALL_STRING,
    name: 'All Accounts',
    cloudProvider: '',
  }
  const allAccountOptions = [
    allAccountOption,
    ...awsAccountOptions,
    ...gcpAccountOptions,
  ]
  const filterOptions: FilterOptions = {
    accounts: [
      { key: 'all', name: 'All Accounts', cloudProvider: '' },
      { key: '321321321', name: 'testaccount0', cloudProvider: 'aws' },
      { key: '321321322', name: 'testaccount1', cloudProvider: 'aws' },
      { key: '123123123', name: 'testaccount2', cloudProvider: 'gcp' },
      { key: '123412341', name: 'testaccount3', cloudProvider: 'gcp' },
    ],
    services: [
      { key: 'all', name: 'All Services' },
      { key: 'ebs', name: 'EBS', cloudProvider: 'aws' },
      { key: 'ec2', name: 'EC2', cloudProvider: 'aws' },
      { key: 'elasticache', name: 'ElastiCache', cloudProvider: 'aws' },
      { key: 'lambda', name: 'Lambda', cloudProvider: 'aws' },
      { key: 'rds', name: 'RDS', cloudProvider: 'aws' },
      { key: 's3', name: 'S3', cloudProvider: 'aws' },
      { key: 'computeEngine', name: 'Compute Engine', cloudProvider: 'gcp' },
    ],
    cloudProviders: CLOUD_PROVIDER_OPTIONS,
  }

  //TODO: Make this test not rely on EmissionFilters' CreateOptionChooser function
  describe('handleSelections', () => {
    let testFilters

    beforeEach(() => {
      testFilters = new EmissionsFilters()
    })

    it('should return all cloudProviders, accounts and services when all providers was selected', () => {
      const result = FiltersUtil.handleDropdownSelections(
        testFilters.createOptionChooser(
          DropdownFilterOptions.CLOUD_PROVIDERS,
          allProviderOptions,
          {
            services: awsServiceOptions,
            accounts: awsAccountOptions,
            cloudProviders: [awsProviderOption],
          },
          filterOptions,
        ),
      )
      expect(result.cloudProviders).toEqual(allProviderOptions)
      expect(result.accounts).toEqual(allAccountOptions)
      expect(result.services).toEqual(allServiceOptions)
    })
    it('should return all cloudProviders, accounts and services when all accounts was selected', () => {
      const result = FiltersUtil.handleDropdownSelections(
        testFilters.createOptionChooser(
          DropdownFilterOptions.ACCOUNTS,
          allAccountOptions,
          {
            services: allServiceOptions,
            accounts: [...awsAccountOptions, gcpAccountOptions[0]],
            cloudProviders: allProviderOptions,
          },
          filterOptions,
        ),
      )
      expect(result.cloudProviders).toEqual(allProviderOptions)
      expect(result.accounts).toEqual(allAccountOptions)
      expect(result.services).toEqual(allServiceOptions)
    })
    it('should return all cloudProviders, accounts and services when all services was selected', () => {
      expect(
        FiltersUtil.handleDropdownSelections(
          testFilters.createOptionChooser(
            DropdownFilterOptions.SERVICES,
            allServiceOptions,
            {
              services: awsServiceOptions,
              accounts: awsAccountOptions,
              cloudProviders: [awsProviderOption],
            },
            filterOptions,
          ),
        ),
      ).toEqual({
        cloudProviders: allProviderOptions,
        accounts: allAccountOptions,
        services: allServiceOptions,
      })
    })
    it('should return empty cloudProviders, accounts and services when all providers was unselected', () => {
      const handleSelectionResult = FiltersUtil.handleDropdownSelections(
        testFilters.createOptionChooser(
          DropdownFilterOptions.CLOUD_PROVIDERS,
          [awsProviderOption, gcpProviderOption],
          {
            services: allServiceOptions,
            accounts: allAccountOptions,
            cloudProviders: allProviderOptions,
          },
          filterOptions,
        ),
      )
      expect(handleSelectionResult.cloudProviders).toEqual([])
      expect(handleSelectionResult.accounts).toEqual([])
      expect(handleSelectionResult.services).toEqual([])
    })
    it('should return empty cloudProviders, accounts and services when all accounts was unselected', () => {
      const handleSelectionResult = FiltersUtil.handleDropdownSelections(
        testFilters.createOptionChooser(
          DropdownFilterOptions.ACCOUNTS,
          [...awsAccountOptions, ...gcpAccountOptions],
          {
            services: allServiceOptions,
            accounts: allAccountOptions,
            cloudProviders: allProviderOptions,
          },
          filterOptions,
        ),
      )
      expect(handleSelectionResult.cloudProviders).toEqual([])
      expect(handleSelectionResult.accounts).toEqual([])
      expect(handleSelectionResult.services).toEqual([])
    })
    it('should return empty cloudProviders, accounts and services when all services was unselected', () => {
      const handleSelectionResult = FiltersUtil.handleDropdownSelections(
        testFilters.createOptionChooser(
          DropdownFilterOptions.SERVICES,
          [...awsServiceOptions, computeEngineServiceOption],
          {
            services: allServiceOptions,
            accounts: allAccountOptions,
            cloudProviders: allProviderOptions,
          },
          filterOptions,
        ),
      )
      expect(handleSelectionResult.cloudProviders).toEqual([])
      expect(handleSelectionResult.accounts).toEqual([])
      expect(handleSelectionResult.services).toEqual([])
    })
    it('should return aws cloudProviders, accounts and services when gcp provider was unselected', () => {
      const handleSelectionResult = FiltersUtil.handleDropdownSelections(
        testFilters.createOptionChooser(
          DropdownFilterOptions.CLOUD_PROVIDERS,
          [allProviderOption, awsProviderOption],
          {
            services: allServiceOptions,
            accounts: allAccountOptions,
            cloudProviders: allProviderOptions,
          },
          filterOptions,
        ),
      )
      expect(handleSelectionResult.cloudProviders).toEqual([awsProviderOption])
      expect(handleSelectionResult.accounts).toEqual(awsAccountOptions)
      expect(handleSelectionResult.services).toEqual(awsServiceOptions)
    })
    it('should return aws cloudProviders, accounts and services when gcpAccount was unselected', () => {
      const handleSelectionResult = FiltersUtil.handleDropdownSelections(
        testFilters.createOptionChooser(
          DropdownFilterOptions.ACCOUNTS,
          awsAccountOptions,
          {
            services: allServiceOptions,
            accounts: [...awsAccountOptions, gcpAccountOptions[0]],
            cloudProviders: allProviderOptions,
          },
          filterOptions,
        ),
      )
      expect(handleSelectionResult.cloudProviders).toEqual([awsProviderOption])
      expect(handleSelectionResult.accounts).toEqual(awsAccountOptions)
      expect(handleSelectionResult.services).toEqual(awsServiceOptions)
    })
    it('should return aws cloudProviders, accounts and services when computeEngine was unselected', () => {
      const handleSelectionResult = FiltersUtil.handleDropdownSelections(
        testFilters.createOptionChooser(
          DropdownFilterOptions.SERVICES,
          [allServiceOption, ...awsServiceOptions],
          {
            services: allServiceOptions,
            accounts: allAccountOptions,
            cloudProviders: allProviderOptions,
          },
          filterOptions,
        ),
      )
      expect(handleSelectionResult.cloudProviders).toEqual([awsProviderOption])
      expect(handleSelectionResult.accounts).toEqual(awsAccountOptions)
      expect(handleSelectionResult.services).toEqual(awsServiceOptions)
    })
    it('should return all cloudProviders and services, but only selected accounts when a GCP account is selected but other GCP accounts are unselected ', () => {
      const handleSelectionResult = FiltersUtil.handleDropdownSelections(
        testFilters.createOptionChooser(
          DropdownFilterOptions.ACCOUNTS,
          [...awsAccountOptions, gcpAccountOptions[0]],
          {
            services: allServiceOptions,
            accounts: awsAccountOptions,
            cloudProviders: allProviderOptions,
          },
          filterOptions,
        ),
      )
      expect(handleSelectionResult.cloudProviders).toEqual(allProviderOptions)
      expect(handleSelectionResult.accounts).toEqual([
        ...awsAccountOptions,
        gcpAccountOptions[0],
      ])
      expect(handleSelectionResult.services).toEqual(allServiceOptions)
    })
    it('should return non changed services when all AWS accounts were selected and an AWS account is unselected ', () => {
      const handleSelectionResult = FiltersUtil.handleDropdownSelections(
        testFilters.createOptionChooser(
          DropdownFilterOptions.ACCOUNTS,
          [allAccountOption, awsAccountOptions[0], ...gcpAccountOptions],
          {
            services: [ebsServiceOption, computeEngineServiceOption],
            accounts: allAccountOptions,
            cloudProviders: allProviderOptions,
          },
          filterOptions,
        ),
      )
      expect(handleSelectionResult.cloudProviders).toEqual(allProviderOptions)
      expect(handleSelectionResult.accounts).toEqual([
        awsAccountOptions[0],
        ...gcpAccountOptions,
      ])
      expect(handleSelectionResult.services).toEqual([
        ebsServiceOption,
        computeEngineServiceOption,
      ])
    })
    it('should return non changed accounts when all AWS services were selected and an AWS service is unselected ', () => {
      const handleSelectionResult = FiltersUtil.handleDropdownSelections(
        testFilters.createOptionChooser(
          DropdownFilterOptions.SERVICES,
          [awsServiceOptions[0], computeEngineServiceOption],
          {
            services: [
              awsServiceOptions[0],
              awsServiceOptions[1],
              computeEngineServiceOption,
            ],
            accounts: [awsAccountOptions[0], ...gcpAccountOptions],
            cloudProviders: allProviderOptions,
          },
          filterOptions,
        ),
      )
      expect(handleSelectionResult.cloudProviders).toEqual(allProviderOptions)
      expect(handleSelectionResult.accounts).toEqual([
        awsAccountOptions[0],
        ...gcpAccountOptions,
      ])
      expect(handleSelectionResult.services).toEqual([
        awsServiceOptions[0],
        computeEngineServiceOption,
      ])
    })
  })
})
