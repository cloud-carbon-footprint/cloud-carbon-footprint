/*
 * © 2021 Thoughtworks, Inc.
 */
import { DropdownOption } from 'Types'

export class Filters {
  accounts = [
    {
      cloudProvider: '',
      key: 'all',
      name: 'All Accounts',
    },
    {
      cloudProvider: 'aws',
      key: '1212121222121',
      name: 'test account',
    },
  ]

  withAccounts(): {
    timeframe: number
    services: []
    accounts: []
    cloudProvider: DropdownOption[]
    dateRange: null
  } {
    return {
      timeframe: 12,
      services: [],
      accounts: [],
      cloudProvider: [
        { key: 'all', name: 'All Cloud Providers' },
        { key: 'aws', name: 'AWS' },
        { key: 'gcp', name: 'GCP' },
      ],
      dateRange: null,
    }
  }

  accountLabel(): string {
    return 'Accounts: 1 of 1'
  }
}
