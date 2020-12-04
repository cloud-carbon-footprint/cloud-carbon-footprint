/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { FiltersUtil, FilterType } from './FiltersUtil'
import { DropdownOption } from './DropdownFilter'

class FiltersUtilTest extends FiltersUtil {}

describe('filterUtil', () => {
  const ALL_STRING = 'all'
  let util: FiltersUtilTest
  const { SERVICES, CLOUD_PROVIDERS } = FilterType
  const serviceOptions: DropdownOption[] = [
    {
      key: 'ebs',
      name: 'EBS',
    },
    {
      key: 's3',
      name: 'S3',
    },
    {
      key: 'ec2',
      name: 'EC2',
    },
    {
      key: 'elasticache',
      name: 'ElastiCache',
    },
    {
      key: 'rds',
      name: 'RDS',
    },
    {
      key: 'lambda',
      name: 'Lambda',
    },
  ]
  const providerOptions = [{ key: 'aws', name: 'AWS' }]

  beforeEach(() => {
    util = new FiltersUtilTest()
  })
  describe('getDependentKeysFromCurrentFilteredKeys', () => {
    it('should return provider keys when given service keys', () => {
      expect(util.getDesiredKeysFromCurrentFilteredKeys(serviceOptions, ALL_STRING, SERVICES, CLOUD_PROVIDERS)).toEqual(
        providerOptions,
      )
    })
    it('should return service keys when given provider keys', () => {
      expect(
        util.getDesiredKeysFromCurrentFilteredKeys(providerOptions, ALL_STRING, CLOUD_PROVIDERS, SERVICES),
      ).toEqual(serviceOptions)
    })
  })
})
