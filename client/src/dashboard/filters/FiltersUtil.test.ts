/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
import { FiltersUtil, FilterType } from './FiltersUtil'
import { DropdownOption } from './DropdownFilter'
import { ALL_SERVICES_VALUE } from '../services'
import { ALL_CLOUD_PROVIDERS_VALUE } from '../cloudProviders'
class FiltersUtilTest extends FiltersUtil {}

jest.mock('./AccountFilter', () => ({
  ACCOUNT_OPTIONS: [
    { key: 'all', name: 'All Accounts', cloudProvider: '' },
    { key: '321321321', name: 'testaccount0', cloudProvider: 'aws' },
    { key: '123123123', name: 'testaccount1', cloudProvider: 'gcp' },
    { key: '123412341', name: 'testaccount2', cloudProvider: 'gcp' },
  ],
}))

jest.mock('../../ConfigLoader', () => {
  return jest.fn().mockImplementation(() => {
    return {
      AWS: {
        CURRENT_SERVICES: [
          { key: 'ebs', name: 'EBS' },
          { key: 's3', name: 'S3' },
          { key: 'ec2', name: 'EC2' },
          { key: 'elasticache', name: 'ElastiCache' },
          { key: 'rds', name: 'RDS' },
          { key: 'lambda', name: 'Lambda' },
        ],
      },
      GCP: {
        CURRENT_SERVICES: [{ key: 'computeEngine', name: 'Compute Engine' }],
      },
      CURRENT_PROVIDERS: [
        { key: 'aws', name: 'AWS' },
        { key: 'gcp', name: 'GCP' },
      ],
    }
  })
})

describe('filterUtil', () => {
  const ALL_STRING = 'all'
  let util: FiltersUtilTest
  const { SERVICES, CLOUD_PROVIDERS, ACCOUNTS } = FilterType
  const ebsServiceOption = {
    key: 'ebs',
    name: 'EBS',
  }
  const s3ServiceOption = {
    key: 's3',
    name: 'S3',
  }
  const ec2ServiceOption = {
    key: 'ec2',
    name: 'EC2',
  }
  const elastiCacheServiceOption = {
    key: 'elasticache',
    name: 'ElastiCache',
  }
  const rdsServiceOption = {
    key: 'rds',
    name: 'RDS',
  }
  const lambdaServiceOption = {
    key: 'lambda',
    name: 'Lambda',
  }
  const computeEngineServiceOption = { key: 'computeEngine', name: 'Compute Engine' }

  const awsServiceOptions: DropdownOption[] = [
    ebsServiceOption,
    s3ServiceOption,
    ec2ServiceOption,
    elastiCacheServiceOption,
    rdsServiceOption,
    lambdaServiceOption,
  ]
  const allServiceOption = { key: ALL_STRING, name: ALL_SERVICES_VALUE }
  const allServiceOptions: DropdownOption[] = [allServiceOption, ...awsServiceOptions, computeEngineServiceOption]
  const awsProviderOption = { key: 'aws', name: 'AWS' }
  const gcpProviderOption = { key: 'gcp', name: 'GCP' }
  const allProviderOption = { key: ALL_STRING, name: ALL_CLOUD_PROVIDERS_VALUE }
  const allProviderOptions = [allProviderOption, awsProviderOption, gcpProviderOption]
  const awsAccountOption = { key: '321321321', name: 'testaccount0', cloudProvider: 'aws' }
  const gcpAccountOptions = [
    { key: '123123123', name: 'testaccount1', cloudProvider: 'gcp' },
    { key: '123412341', name: 'testaccount2', cloudProvider: 'gcp' },
  ]
  const allAccountOption = { key: ALL_STRING, name: 'All Accounts', cloudProvider: '' }
  const allAccountOptions = [allAccountOption, awsAccountOption, ...gcpAccountOptions]

  beforeEach(() => {
    util = new FiltersUtilTest()
  })
  describe('serviceTypesInAccountSelection', () => {
    it('should return Aws Services when only Aws Accounts selected', () => {
      expect(util.serviceTypesInAccountSelection([awsAccountOption])).toEqual(awsServiceOptions)
    })
    it('should return all Services when aws and gcp Accounts selected', () => {
      expect(util.serviceTypesInAccountSelection([awsAccountOption, gcpAccountOptions[0]])).toEqual([
        ...awsServiceOptions,
        computeEngineServiceOption,
      ])
    })
    it('should return no Services when no Accounts selected', () => {
      expect(util.serviceTypesInAccountSelection([])).toEqual([])
    })
  })

  describe('getDependentKeysFromCurrentFilteredKeys', () => {
    it('should return provider keys when given service keys', () => {
      expect(
        util.getDesiredKeysFromCurrentFilteredKeys(awsServiceOptions, ALL_STRING, SERVICES, CLOUD_PROVIDERS),
      ).toEqual([awsProviderOption])
    })
    it('should return account keys when given service keys', () => {
      expect(util.getDesiredKeysFromCurrentFilteredKeys(awsServiceOptions, ALL_STRING, SERVICES, ACCOUNTS)).toEqual([
        awsAccountOption,
      ])
    })
    it('should return service keys when given provider keys', () => {
      expect(
        util.getDesiredKeysFromCurrentFilteredKeys([awsProviderOption], ALL_STRING, CLOUD_PROVIDERS, SERVICES),
      ).toEqual(awsServiceOptions)
    })
    it('should return account keys when given provider keys', () => {
      expect(
        util.getDesiredKeysFromCurrentFilteredKeys([awsProviderOption], ALL_STRING, CLOUD_PROVIDERS, ACCOUNTS),
      ).toEqual([awsAccountOption])
    })
    it('should return provider keys when given account keys', () => {
      expect(
        util.getDesiredKeysFromCurrentFilteredKeys([awsAccountOption], ALL_STRING, ACCOUNTS, CLOUD_PROVIDERS),
      ).toEqual([awsProviderOption])
    })
  })
  describe('handleSelections', () => {
    it('should return all providerKeys, accountKeys and serviceKeys when all providers was selected', () => {
      const result = util.handleSelections(
        allProviderOptions,
        [awsProviderOption],
        ALL_STRING,
        allProviderOptions,
        FilterType.CLOUD_PROVIDERS,
      )
      expect(result.providerKeys).toEqual(allProviderOptions)
      expect(result.accountKeys).toEqual(allAccountOptions)
      expect(result.serviceKeys).toEqual(allServiceOptions)
    })
    it('should return all providerKeys, accountKeys and serviceKeys when all accounts was selected', () => {
      const result = util.handleSelections(
        allAccountOptions,
        [awsAccountOption],
        ALL_STRING,
        allAccountOptions,
        FilterType.ACCOUNTS,
      )
      expect(result.providerKeys).toEqual(allProviderOptions)
      expect(result.accountKeys).toEqual(allAccountOptions)
      expect(result.serviceKeys).toEqual(allServiceOptions)
    })
    it('should return all providerKeys, accountKeys and serviceKeys when all services was selected', () => {
      expect(
        util.handleSelections(allServiceOptions, awsServiceOptions, ALL_STRING, allServiceOptions, FilterType.SERVICES),
      ).toEqual({ providerKeys: allProviderOptions, accountKeys: allAccountOptions, serviceKeys: allServiceOptions })
    })
    it('should return empty providerKeys, accountKeys and serviceKeys when all providers was unselected', () => {
      const handleSelectionResult = util.handleSelections(
        [awsProviderOption, gcpProviderOption],
        allProviderOptions,
        ALL_STRING,
        allProviderOptions,
        FilterType.CLOUD_PROVIDERS,
      )
      expect(handleSelectionResult.providerKeys).toEqual([])
      expect(handleSelectionResult.accountKeys).toEqual([])
      expect(handleSelectionResult.serviceKeys).toEqual([])
    })
    it('should return empty providerKeys, accountKeys and serviceKeys when all accounts was unselected', () => {
      const handleSelectionResult = util.handleSelections(
        [awsAccountOption, ...gcpAccountOptions],
        allAccountOptions,
        ALL_STRING,
        allAccountOptions,
        FilterType.ACCOUNTS,
      )
      expect(handleSelectionResult.providerKeys).toEqual([])
      expect(handleSelectionResult.accountKeys).toEqual([])
      expect(handleSelectionResult.serviceKeys).toEqual([])
    })
    it('should return empty providerKeys, accountKeys and serviceKeys when all services was unselected', () => {
      const handleSelectionResult = util.handleSelections(
        [...awsServiceOptions, computeEngineServiceOption],
        allServiceOptions,
        ALL_STRING,
        allServiceOptions,
        FilterType.SERVICES,
      )
      expect(handleSelectionResult.providerKeys).toEqual([])
      expect(handleSelectionResult.accountKeys).toEqual([])
      expect(handleSelectionResult.serviceKeys).toEqual([])
    })
    it('should return aws providerKeys, accountKeys and serviceKeys when gcp provider was unselected', () => {
      const handleSelectionResult = util.handleSelections(
        [allProviderOption, awsProviderOption],
        allProviderOptions,
        ALL_STRING,
        allProviderOptions,
        FilterType.CLOUD_PROVIDERS,
      )
      expect(handleSelectionResult.providerKeys).toEqual([awsProviderOption])
      expect(handleSelectionResult.accountKeys).toEqual([awsAccountOption])
      expect(handleSelectionResult.serviceKeys).toEqual(awsServiceOptions)
    })
    it('should return aws providerKeys, accountKeys and serviceKeys when gcpAccount was unselected', () => {
      const handleSelectionResult = util.handleSelections(
        [allAccountOption, awsAccountOption],
        [allAccountOption, awsAccountOption, gcpAccountOptions[0]],
        ALL_STRING,
        allAccountOptions,
        FilterType.ACCOUNTS,
      )
      expect(handleSelectionResult.providerKeys).toEqual([awsProviderOption])
      // expect(handleSelectionResult.accountKeys).toEqual([awsAccountOption])
      // expect(handleSelectionResult.serviceKeys).toEqual(awsServiceOptions)
    })
    it('should return aws providerKeys, accountKeys and serviceKeys when computeEngine was unselected', () => {
      const handleSelectionResult = util.handleSelections(
        [allServiceOption, ...awsServiceOptions],
        allServiceOptions,
        ALL_STRING,
        allServiceOptions,
        FilterType.SERVICES,
      )
      expect(handleSelectionResult.providerKeys).toEqual([awsProviderOption])
      expect(handleSelectionResult.accountKeys).toEqual([awsAccountOption])
      expect(handleSelectionResult.serviceKeys).toEqual(awsServiceOptions)
    })
    it('should return all providerKeys and serviceKeys, but only selected accounts when a GCP account is selected but other GCP accounts are unselected ', () => {
      const handleSelectionResult = util.handleSelections(
        [awsAccountOption, gcpAccountOptions[0]],
        [awsAccountOption],
        ALL_STRING,
        allAccountOptions,
        FilterType.ACCOUNTS,
      )
      expect(handleSelectionResult.providerKeys).toEqual(allProviderOptions)
      expect(handleSelectionResult.accountKeys).toEqual([awsAccountOption, gcpAccountOptions[0]])
      expect(handleSelectionResult.serviceKeys).toEqual(allServiceOptions)
    })
  })
})
