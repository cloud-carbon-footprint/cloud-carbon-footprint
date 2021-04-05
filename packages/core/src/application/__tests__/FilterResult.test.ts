/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import { Account, getAccounts } from '../FilterResult'

describe('getFilterResults', () => {
  it('AWS results', () => {
    const mockAwsAccount: Account = {
      cloudProvider: 'aws',
      key: '123456678',
      name: 'Test Account',
    }
    const mockGcpAccount: Account = {
      cloudProvider: 'gcp',
      key: '123456679',
      name: 'GCP Test Account',
    }
    const expectedArrayResults = [mockAwsAccount, mockGcpAccount]

    expect(expectedArrayResults).toEqual(getAccounts())
  })
  it('no GCP results', () => {
    delete process.env.GCP_PROJECTS
    const mockAwsAccount: Account = {
      cloudProvider: 'aws',
      key: '123456678',
      name: 'Test Account',
    }
    const expectedArrayResults = [mockAwsAccount]

    expect(expectedArrayResults).toEqual(getAccounts())
  })
})
