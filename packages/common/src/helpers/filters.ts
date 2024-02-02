/*
 * © 2021 Thoughtworks, Inc.
 */

import { AccountDetailsOrIdList } from '../Types'

export const getAccountIdsFromList = (
  accounts: AccountDetailsOrIdList,
): string[] => {
  const accountIds = []

  if (!accounts || !Array.isArray(accounts)) {
    throw new Error(
      'List must be a valid array of IDs or objects containing account details',
    )
  }

  for (const account of accounts) {
    if (typeof account === 'string') {
      accountIds.push(account)
    } else if (account.id) {
      accountIds.push(account.id)
    }
  }

  return accountIds
}

export const buildAccountFilter = (
  accounts: AccountDetailsOrIdList,
  columnName: string,
): string => {
  const accountIds = getAccountIdsFromList(accounts)

  if (!accountIds.length) return ''

  const formattedAccountIds = accountIds
    .map((accountId) => `'${accountId}'`)
    .join(', ')

  return `AND ${columnName} IN (${formattedAccountIds})`
}
