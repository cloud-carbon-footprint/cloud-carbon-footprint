/*
 * © 2021 Thoughtworks, Inc.
 */

import { SubscriptionClient } from '@azure/arm-resources-subscriptions'
import commander from 'commander'
import process from 'process'
import { createObjectCsvWriter } from 'csv-writer'
import path from 'path'
import { wait } from '@cloud-carbon-footprint/common'
import { AzureCredentialsProvider } from '@cloud-carbon-footprint/azure'
import { PagedAsyncIterableIterator } from '@azure/core-paging'
import {
  ConsumptionManagementClient,
  LegacyUsageDetail,
  ModernUsageDetail,
  UsageDetailUnion,
} from '@azure/arm-consumption'

/**
 * Creates a csv file with input data for Azure to be used for the Lookup Table.
 * Since Azure doesn't allow custom queries, this needs to be manually created.
 */
async function createAzureInput(argv: string[] = process.argv): Promise<void> {
  const program = new commander.Command()
  program.storeOptionsAsProperties(false)

  program
    .option('-s, --startDate <string>', 'Start date in ISO format')
    .option('-e, --endDate <string>', 'End date in ISO format')
    .option('-o, --output <string>', 'Output file path', 'azure_input.csv')

  program.parse(argv)
  const programOptions = program.opts() as {
    startDate: string
    endDate: string
    output: string
  }

  const endDate = programOptions.endDate
    ? new Date(programOptions.endDate)
    : new Date()

  const startDate = programOptions.startDate
    ? new Date(programOptions.startDate)
    : new Date(endDate.toISOString())

  if (!programOptions.startDate) {
    startDate.setDate(startDate.getDate() - 30) // Subtract 30 days from end date
  }

  const targetDestination = path.join(process.cwd(), programOptions.output)

  console.info('Creating Azure input file...')
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

  const azureData = await getConsumptionUsageDetails(startDate, endDate)
  await csvWriter.writeRecords(azureData)
  console.info('File saved to ', targetDestination)
  console.info('Azure Input CSV successfully created! Have fun out there :D')
}

async function getConsumptionUsageDetails(startDate: Date, endDate: Date) {
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

  let usageDetails: Array<LegacyUsageDetail | ModernUsageDetail> = []
  console.info(
    `Getting usage details for ${
      subscriptions.length
    } subscriptions. This may take a while...  ${String.fromCodePoint(
      0x2615,
    )} `,
  )

  for await (const subscription of subscriptions) {
    const consumptionManagementClient = new ConsumptionManagementClient(
      credentials,
      subscription.id,
    )
    console.info(`Getting usage rows for ${subscription.displayName}`)
    const usageRowDetails = await getUsageRows(
      startDate,
      endDate,
      consumptionManagementClient,
    )

    usageDetails = usageDetails.concat(usageRowDetails)
  }

  // Filter by range, map to columns, remove rows with empty values, and grab unique rows
  const inputRows: any = usageDetails
    .filter(
      (consumptionRow: any) =>
        new Date(consumptionRow.properties.date) >= startDate &&
        new Date(consumptionRow.properties.date) <= endDate,
    )
    .map((consumptionRow: any) => {
      if (consumptionRow.kind === 'modern') {
        return {
          region: consumptionRow.properties.resourceLocation,
          serviceName: consumptionRow.properties.meterCategory,
          usageType: consumptionRow.properties.meterName,
          usageUnit: consumptionRow.properties.unitOfMeasure,
        }
      } else {
        return {
          region: consumptionRow.properties.resourceLocation,
          serviceName: consumptionRow.properties.meterDetails.meterCategory,
          usageType: consumptionRow.properties.meterDetails.meterName,
          usageUnit: consumptionRow.properties.meterDetails.unitOfMeasure,
        }
      }
    })
    .filter((row: any) => {
      const isValidRow = Object.values(row).every((value) => value !== null)
      if (!isValidRow) {
        console.warn(
          `Found row with missing value, skipping -> region: ${row.region}, serviceName: ${row.serviceName}, usageType: ${row.usageType}, usageUnit: ${row.usageUnit}`,
        )
      }
      return isValidRow
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

async function getUsageRows(
  startDate: Date,
  endDate: Date,
  consumptionManagementClient: ConsumptionManagementClient,
  retry = false,
): Promise<Array<LegacyUsageDetail | ModernUsageDetail>> {
  try {
    const options = {
      expand: 'properties/meterDetails',
      filter: `properties/usageStart ge '${startDate.toISOString()}' AND properties/usageEnd le '${endDate.toISOString()}'`,
    }
    const usageRows = consumptionManagementClient.usageDetails.list(
      `/${consumptionManagementClient.subscriptionId}/`,
      options,
    )
    const usageRowDetails = await pageThroughUsageRows(usageRows)
    if (retry) {
      console.log('Retry Successful! Continuing grabbing estimates...')
    }
    return usageRowDetails
  } catch (e) {
    const retryAfterValue = getConsumptionTenantValue(e, 'retry')
    const rateLimitRemainingValue = getConsumptionTenantValue(e, 'remaining')
    const errorMsg =
      'Azure ConsumptionManagementClient UsageDetailRow paging failed. Reason:'
    if (rateLimitRemainingValue == 0) {
      console.warn(`${errorMsg} ${e.message}`)
      console.log(`Retrying after ${retryAfterValue} seconds`)
      retry = true
      await wait(retryAfterValue * 1000)
      return getUsageRows(
        startDate,
        endDate,
        consumptionManagementClient,
        retry,
      )
    } else {
      throw new Error(`${errorMsg} ${e.message}`)
    }
  }
}

// This part is going to take a while, so grab a coffee and a good book
async function pageThroughUsageRows(
  usageRows: PagedAsyncIterableIterator<UsageDetailUnion>,
): Promise<Array<LegacyUsageDetail | ModernUsageDetail>> {
  const usageRowDetails: Array<LegacyUsageDetail | ModernUsageDetail> = []
  let currentRow
  let hasNextPage = true
  try {
    while (hasNextPage) {
      currentRow = await usageRows.next()
      if (currentRow?.value) {
        const details =
          currentRow.value.kind === 'modern'
            ? (currentRow.value as ModernUsageDetail)
            : (currentRow.value as LegacyUsageDetail)
        usageRowDetails.push(details)
      }
      hasNextPage = !currentRow.done
    }
  } catch (error) {
    throw error
  }
  return usageRowDetails
}

function getConsumptionTenantValue(e: any, type: string) {
  const tenantHeaders: { [key: string]: string } = {
    retry: 'x-ms-ratelimit-microsoft.consumption-tenant-retry-after',
    remaining: 'x-ms-ratelimit-remaining-microsoft.consumption-tenant-requests',
  }
  return e.response.headers._headersMap.get(tenantHeaders[type])?.value
}

createAzureInput().catch((error) => {
  console.error(`Something went wrong: ${error.message}`)
  console.trace(error)
})
