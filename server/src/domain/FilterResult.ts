/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

export default interface FilterResult {
  accounts: Account[]
}

export interface Account {
  cloudProvider: string
  key: string
  name: string
}

export const getAccounts = (): Account[] => {
  const listOfAllAccounts: Account[] = []

  if (process.env.AWS_ACCOUNTS) {
    const awsAccounts: { id: string; name: string }[] = JSON.parse(process.env.AWS_ACCOUNTS)
    awsAccounts.forEach((awsAccount: { id: string; name: string }) => {
      listOfAllAccounts.push({ cloudProvider: 'AWS', key: awsAccount.id, name: awsAccount.name })
    })
  }

  if (process.env.GCP_PROJECTS) {
    const gcpAccounts: { id: string; name: string }[] = JSON.parse(process.env.GCP_PROJECTS)
    gcpAccounts.forEach((gcpAccount: { id: string; name: string }) => {
      listOfAllAccounts.push({ cloudProvider: 'GCP', key: gcpAccount.id, name: gcpAccount.name })
    })
  }

  return listOfAllAccounts
}
