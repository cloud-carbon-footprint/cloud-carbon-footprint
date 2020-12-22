/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
import { FiltersUtil, FilterType } from './FiltersUtil'
import { DropdownOption } from './DropdownFilter'
import { ALL_CLOUD_PROVIDERS_VALUE, ALL_SERVICES_VALUE } from './DropdownConstants'
class FiltersUtilTest extends FiltersUtil {}

jest.mock('./AccountFilter', () => ({
  ACCOUNT_OPTIONS: [
    { key: 'all', name: 'All Accounts', cloudProvider: '' },
    { key: '321321321', name: 'testaccount0', cloudProvider: 'aws' },
    { key: '321321322', name: 'testaccount1', cloudProvider: 'aws' },
    { key: '123123123', name: 'testaccount2', cloudProvider: 'gcp' },
    { key: '123412341', name: 'testaccount3', cloudProvider: 'gcp' },
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
  const awsAccountOptions = [
    { key: '321321321', name: 'testaccount0', cloudProvider: 'aws' },
    { key: '321321322', name: 'testaccount1', cloudProvider: 'aws' },
  ]
  const gcpAccountOptions = [
    { key: '123123123', name: 'testaccount2', cloudProvider: 'gcp' },
    { key: '123412341', name: 'testaccount3', cloudProvider: 'gcp' },
  ]
  const allAccountOption = { key: ALL_STRING, name: 'All Accounts', cloudProvider: '' }
  const allAccountOptions = [allAccountOption, ...awsAccountOptions, ...gcpAccountOptions]

  beforeEach(() => {
    util = new FiltersUtilTest()
  })
  describe('serviceTypesInAccountSelection', () => {
    it('should return Aws Services when only Aws Accounts selected', () => {
      expect(util.serviceTypesInAccountSelection(awsAccountOptions)).toEqual(awsServiceOptions)
    })
    it('should return all Services when aws and gcp Accounts selected', () => {
      expect(util.serviceTypesInAccountSelection([awsAccountOptions[0], gcpAccountOptions[0]])).toEqual([
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
        util.getDesiredKeysFromCurrentFilteredKeys(
          awsServiceOptions,
          { services: allServiceOptions, accounts: allAccountOptions, cloudProviders: allProviderOptions },
          SERVICES,
          CLOUD_PROVIDERS,
        ),
      ).toEqual([awsProviderOption])
    })
    it('should return account keys when given service keys', () => {
      expect(
        util.getDesiredKeysFromCurrentFilteredKeys(
          allServiceOptions,
          { services: allServiceOptions, accounts: allAccountOptions, cloudProviders: allProviderOptions },
          SERVICES,
          ACCOUNTS,
        ),
      ).toEqual(allAccountOptions)
    })
    it('should return service keys when given provider keys', () => {
      expect(
        util.getDesiredKeysFromCurrentFilteredKeys(
          [awsProviderOption],
          { services: allServiceOptions, accounts: allAccountOptions, cloudProviders: allProviderOptions },
          CLOUD_PROVIDERS,
          SERVICES,
        ),
      ).toEqual(awsServiceOptions)
    })
    it('should return account keys when given provider keys', () => {
      expect(
        util.getDesiredKeysFromCurrentFilteredKeys(
          [awsProviderOption],
          { services: allServiceOptions, accounts: allAccountOptions, cloudProviders: allProviderOptions },
          CLOUD_PROVIDERS,
          ACCOUNTS,
        ),
      ).toEqual(awsAccountOptions)
    })
    it('should return provider keys when given account keys', () => {
      expect(
        util.getDesiredKeysFromCurrentFilteredKeys(
          awsAccountOptions,
          { services: allServiceOptions, accounts: allAccountOptions, cloudProviders: allProviderOptions },
          ACCOUNTS,
          CLOUD_PROVIDERS,
        ),
      ).toEqual([awsProviderOption])
    })
  })
  describe('handleSelections', () => {
    it('should return all providerKeys, accountKeys and serviceKeys when all providers was selected', () => {
      const result = util.handleSelections(
        allProviderOptions,
        { services: awsServiceOptions, accounts: awsAccountOptions, cloudProviders: [awsProviderOption] },
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
        {
          services: allServiceOptions,
          accounts: [...awsAccountOptions, gcpAccountOptions[0]],
          cloudProviders: allProviderOptions,
        },
        allAccountOptions,
        FilterType.ACCOUNTS,
      )
      expect(result.providerKeys).toEqual(allProviderOptions)
      expect(result.accountKeys).toEqual(allAccountOptions)
      expect(result.serviceKeys).toEqual(allServiceOptions)
    })
    it('should return all providerKeys, accountKeys and serviceKeys when all services was selected', () => {
      expect(
        util.handleSelections(
          allServiceOptions,
          { services: awsServiceOptions, accounts: awsAccountOptions, cloudProviders: [awsProviderOption] },
          allServiceOptions,
          FilterType.SERVICES,
        ),
      ).toEqual({ providerKeys: allProviderOptions, accountKeys: allAccountOptions, serviceKeys: allServiceOptions })
    })
    it('should return empty providerKeys, accountKeys and serviceKeys when all providers was unselected', () => {
      const handleSelectionResult = util.handleSelections(
        [awsProviderOption, gcpProviderOption],
        { services: allServiceOptions, accounts: allAccountOptions, cloudProviders: allProviderOptions },
        allProviderOptions,
        FilterType.CLOUD_PROVIDERS,
      )
      expect(handleSelectionResult.providerKeys).toEqual([])
      expect(handleSelectionResult.accountKeys).toEqual([])
      expect(handleSelectionResult.serviceKeys).toEqual([])
    })
    it('should return empty providerKeys, accountKeys and serviceKeys when all accounts was unselected', () => {
      const handleSelectionResult = util.handleSelections(
        [...awsAccountOptions, ...gcpAccountOptions],
        { services: allServiceOptions, accounts: allAccountOptions, cloudProviders: allProviderOptions },
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
        { services: allServiceOptions, accounts: allAccountOptions, cloudProviders: allProviderOptions },
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
        { services: allServiceOptions, accounts: allAccountOptions, cloudProviders: allProviderOptions },
        allProviderOptions,
        FilterType.CLOUD_PROVIDERS,
      )
      expect(handleSelectionResult.providerKeys).toEqual([awsProviderOption])
      expect(handleSelectionResult.accountKeys).toEqual(awsAccountOptions)
      expect(handleSelectionResult.serviceKeys).toEqual(awsServiceOptions)
    })
    it('should return aws providerKeys, accountKeys and serviceKeys when gcpAccount was unselected', () => {
      const handleSelectionResult = util.handleSelections(
        awsAccountOptions,
        {
          services: allServiceOptions,
          accounts: [...awsAccountOptions, gcpAccountOptions[0]],
          cloudProviders: allProviderOptions,
        },
        allAccountOptions,
        FilterType.ACCOUNTS,
      )
      expect(handleSelectionResult.providerKeys).toEqual([awsProviderOption])
      expect(handleSelectionResult.accountKeys).toEqual(awsAccountOptions)
      expect(handleSelectionResult.serviceKeys).toEqual(awsServiceOptions)
    })
    it('should return aws providerKeys, accountKeys and serviceKeys when computeEngine was unselected', () => {
      const handleSelectionResult = util.handleSelections(
        [allServiceOption, ...awsServiceOptions],
        { services: allServiceOptions, accounts: allAccountOptions, cloudProviders: allProviderOptions },
        allServiceOptions,
        FilterType.SERVICES,
      )
      expect(handleSelectionResult.providerKeys).toEqual([awsProviderOption])
      expect(handleSelectionResult.accountKeys).toEqual(awsAccountOptions)
      expect(handleSelectionResult.serviceKeys).toEqual(awsServiceOptions)
    })
    it('should return all providerKeys and serviceKeys, but only selected accounts when a GCP account is selected but other GCP accounts are unselected ', () => {
      const handleSelectionResult = util.handleSelections(
        [...awsAccountOptions, gcpAccountOptions[0]],
        { services: allServiceOptions, accounts: awsAccountOptions, cloudProviders: allProviderOptions },
        allAccountOptions,
        FilterType.ACCOUNTS,
      )
      expect(handleSelectionResult.providerKeys).toEqual(allProviderOptions)
      expect(handleSelectionResult.accountKeys).toEqual([...awsAccountOptions, gcpAccountOptions[0]])
      expect(handleSelectionResult.serviceKeys).toEqual(allServiceOptions)
    })
    it('should return non changed serviceKeys when all AWS accounts were selected and an AWS account is unselected ', () => {
      const handleSelectionResult = util.handleSelections(
        [allAccountOption, awsAccountOptions[0], ...gcpAccountOptions],
        {
          services: [ebsServiceOption, computeEngineServiceOption],
          accounts: allAccountOptions,
          cloudProviders: allProviderOptions,
        },
        allAccountOptions,
        FilterType.ACCOUNTS,
      )
      expect(handleSelectionResult.providerKeys).toEqual(allProviderOptions)
      expect(handleSelectionResult.accountKeys).toEqual([awsAccountOptions[0], ...gcpAccountOptions])
      expect(handleSelectionResult.serviceKeys).toEqual([ebsServiceOption, computeEngineServiceOption])
    })
    it('should return non changed accounts when all AWS services were selected and an AWS service is unselected ', () => {
      const handleSelectionResult = util.handleSelections(
        [awsServiceOptions[0], computeEngineServiceOption],
        {
          services: [awsServiceOptions[0], awsServiceOptions[1], computeEngineServiceOption],
          accounts: [awsAccountOptions[0], ...gcpAccountOptions],
          cloudProviders: allProviderOptions,
        },
        allAccountOptions,
        FilterType.SERVICES,
      )
      expect(handleSelectionResult.providerKeys).toEqual(allProviderOptions)
      expect(handleSelectionResult.accountKeys).toEqual([awsAccountOptions[0], ...gcpAccountOptions])
      expect(handleSelectionResult.serviceKeys).toEqual([awsServiceOptions[0], computeEngineServiceOption])
    })
  })
})
