/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { FiltersUtil, FilterType } from './FiltersUtil'

class FiltersUtilTest extends FiltersUtil {}

describe('filterUtil', () => {
  const ALL_STRING = 'all'
  let util: FiltersUtilTest
  const { SERVICES, CLOUD_PROVIDERS } = FilterType
  const serviceKeys = ['ebs', 's3', 'ec2', 'elasticache', 'rds', 'lambda']
  const providerKeys = ['aws']

  beforeEach(() => {
    util = new FiltersUtilTest()
  })
  describe('getDependentKeysFromCurrentFilteredKeys', () => {
    it('should return provider keys when given service keys', () => {
      expect(util.getDesiredKeysFromCurrentFilteredKeys(serviceKeys, ALL_STRING, SERVICES, CLOUD_PROVIDERS)).toEqual(
        providerKeys,
      )
    })
    it('should return service keys when given provider keys', () => {
      expect(util.getDesiredKeysFromCurrentFilteredKeys(providerKeys, ALL_STRING, CLOUD_PROVIDERS, SERVICES)).toEqual(
        serviceKeys,
      )
    })
  })
})
