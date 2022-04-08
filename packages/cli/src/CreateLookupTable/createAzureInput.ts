/*
 * © 2021 Thoughtworks, Inc.
 */

import { UsageDetailsListResult } from '@azure/arm-consumption/esm/models'
import { SubscriptionClient } from '@azure/arm-resources-subscriptions'
import { ConsumptionManagementClient } from '@azure/arm-consumption'
import { AzureCredentialsProvider } from '@cloud-carbon-footprint/azure'
import { wait } from '@cloud-carbon-footprint/common'
import { createObjectCsvWriter } from 'csv-writer'
import path from 'path'

/**
 * Creates a csv file with input data for Azure to be used for the Lookup Table.
 * Since Azure doesn't allow custom queries, this needs to be manually created.
 */
async function createAzureInput() {
  console.log('Creating Azure input file')
  const defaultFileName = './azure_input.csv'
  const targetDestination = path.join(process.cwd(), defaultFileName)
  const header = [
    { id: 'serviceName', title: 'serviceName' },
    { id: 'region', title: 'region' },
    { id: 'usageType', title: 'usageType' },
    { id: 'usageUnit', title: 'usageUnit' },
  ]

  const csvWriter = createObjectCsvWriter({
    path: targetDestination,
    header,
  })

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 30) // Subtract 30 days
  const azureData = await getConsumptionUsageDetails()
  await csvWriter.writeRecords(azureData)
  console.log('Azure Input CSV successfully created! Have fun out there :D')
}

async function getConsumptionUsageDetails() {
  const credentials = await AzureCredentialsProvider.create()
  const subscriptionClient = new SubscriptionClient(credentials)
  const subscriptions = []
  for await (const subscription of subscriptionClient.subscriptions.list()) {
    subscriptions.push(subscription)
  }
  if (subscriptions.length === 0)
    console.warn(
      'No subscription returned for these Azure credentials, be sure the registered application has ' +
        'enough permissions. Go to https://www.cloudcarbonfootprint.org/docs/azure/ for more information.',
    )

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 30) // Subtract 30 days

  let usageDetails: any[] = []
  console.log(
    `Getting usage details for ${subscriptions.length} subscriptions. This may take a while...`,
  )

  for await (const subscription of subscriptions) {
    const consumptionManagementClient = new ConsumptionManagementClient(
      credentials,
      subscription.id,
    )
    const usageRows = await getUsageRows(
      startDate,
      endDate,
      consumptionManagementClient,
    )

    const allUsageRows = await pageThroughUsageRows(
      usageRows,
      consumptionManagementClient,
    )
    usageDetails = usageDetails.concat(allUsageRows)
  }

  // Filter by range, map to columns, and grab unique rows
  const inputRows: any = usageDetails
    .filter(
      (consumptionRow) =>
        new Date(consumptionRow.date) >= startDate &&
        new Date(consumptionRow.date) <= endDate,
    )
    .map((consumptionRow) => {
      const isModernDetail = consumptionRow.kind === 'modern'
      return {
        region: consumptionRow.resourceLocation,
        serviceName: isModernDetail
          ? consumptionRow.meterCategory
          : consumptionRow.meterDetails.meterCategory,
        usageType: isModernDetail
          ? consumptionRow.meterName
          : consumptionRow.meterDetails.meterName,
        usageUnit: isModernDetail
          ? consumptionRow.unitOfMeasure
          : consumptionRow.meterDetails.unitOfMeasure,
      }
    })
    .filter(
      (row, index, usageRows) =>
        index ===
        usageRows.findIndex(
          (otherRow) =>
            row.serviceName === otherRow.serviceName &&
            row.region === otherRow.region &&
            row.usageType === otherRow.usageType &&
            row.usageUnit === otherRow.usageUnit,
        ),
    )
  return inputRows
}

/* --------- Helpers ---------- */

// This part is gonna take awhile, so grab a coffee and a good book
async function getUsageRows(
  startDate: Date,
  endDate: Date,
  consumptionManagementClient: ConsumptionManagementClient,
): Promise<any> {
  try {
    const options = {
      expand: 'properties/meterDetails',
      filter: `properties/usageStart ge '${startDate.toISOString()}' AND properties/usageEnd le '${endDate.toISOString()}'`,
    }
    return await consumptionManagementClient.usageDetails.list(
      `/${consumptionManagementClient.subscriptionId}/`,
      options,
    )
  } catch (e) {
    const retryAfterValue = getConsumptionTenantValue(e, 'retry')
    const rateLimitRemainingValue = getConsumptionTenantValue(e, 'remaining')
    const errorMsg =
      'Azure ConsumptionManagementClient.usageDetails.list failed. Reason:'
    if (rateLimitRemainingValue == 0) {
      console.warn(`${errorMsg} ${e.message}`)
      console.log(`Retrying after ${retryAfterValue} seconds`)
      await wait(retryAfterValue * 1000)
      return getUsageRows(startDate, endDate, consumptionManagementClient)
    } else {
      throw new Error(`${errorMsg} ${e.message}`)
    }
  }
}

async function pageThroughUsageRows(
  usageRows: UsageDetailsListResult,
  consumptionManagementClient: ConsumptionManagementClient,
): Promise<UsageDetailsListResult> {
  console.log(
    `Fetching details for ${consumptionManagementClient.subscriptionId}`,
  )
  const allUsageRows = [...usageRows]
  let retry = false
  while (usageRows.nextLink) {
    try {
      const nextUsageRows =
        await consumptionManagementClient.usageDetails.listNext(
          usageRows.nextLink,
        )
      allUsageRows.push(...nextUsageRows)
      usageRows = nextUsageRows
    } catch (e) {
      // check to see if error is from exceeding the rate limit and grab retry time value
      const retryAfterValue = getConsumptionTenantValue(e, 'retry')
      const rateLimitRemainingValue = getConsumptionTenantValue(e, 'remaining')
      const errorMsg =
        'Azure ConsumptionManagementClient.usageDetails.listNext failed. Reason:'
      if (rateLimitRemainingValue == 0) {
        console.warn(`${errorMsg} ${e.message}`)
        console.log(`Retrying after ${retryAfterValue} seconds`)
        retry = true
        await wait(retryAfterValue * 1000)
      } else {
        throw new Error(`${errorMsg} ${e.message}`)
      }
    }
  }
  retry && console.log('Retry Successful! Continuing grabbing estimates...')
  return allUsageRows
}

function getConsumptionTenantValue(e: any, type: string) {
  const tenantHeaders: { [key: string]: string } = {
    retry: 'x-ms-ratelimit-microsoft.consumption-tenant-retry-after',
    remaining: 'x-ms-ratelimit-remaining-microsoft.consumption-tenant-requests',
  }
  return e.response.headers._headersMap[tenantHeaders[type]]?.value
}

createAzureInput()
