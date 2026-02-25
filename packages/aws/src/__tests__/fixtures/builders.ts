/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  GetCostAndUsageCommandOutput,
  GroupDefinitionType,
} from '@aws-sdk/client-cost-explorer'

export function buildCostExplorerGetCostRequest(
  startDate: string,
  endDate: string,
  region: string,
  values: string[],
) {
  return {
    TimePeriod: {
      Start: startDate,
      End: endDate,
    },
    Filter: {
      And: [
        { Dimensions: { Key: 'REGION', Values: [region] } },
        {
          Dimensions: {
            Key: 'USAGE_TYPE_GROUP',
            Values: values,
          },
        },
      ],
    },
    Granularity: 'DAILY',
    GroupBy: [
      {
        Key: 'USAGE_TYPE',
        Type: 'DIMENSION',
      },
    ],
    Metrics: ['AmortizedCost'],
  }
}

export function buildCostExplorerGetCostResponse(
  data: { start: string; amount: number; keys: string[] }[],
) {
  return {
    GroupDefinitions: [
      {
        Type: GroupDefinitionType.DIMENSION,
        Key: 'USAGE_TYPE',
      },
    ],
    ResultsByTime: data.map(({ start, amount }) => {
      return {
        TimePeriod: {
          Start: start,
        },
        Groups: [
          {
            Keys: [],
            Metrics: {
              AmortizedCost: {
                Unit: 'USD',
                Amount: amount ? amount.toString() : amount,
              },
            },
          },
        ],
      }
    }),
  } as unknown as GetCostAndUsageCommandOutput
}

export function buildCostExplorerGetUsageResponse(
  data: { start: string; amount: number; keys: string[] }[],
) {
  return {
    GroupDefinitions: [
      {
        Type: 'DIMENSION',
        Key: 'USAGE_TYPE',
      },
    ],
    ResultsByTime: data.map(({ start, amount, keys }) => {
      return {
        TimePeriod: {
          Start: start,
        },
        Groups: [
          {
            Keys: keys,
            Metrics: {
              UsageQuantity: {
                Amount: amount ? amount.toString() : amount,
              },
            },
          },
        ],
      }
    }),
  } as unknown as GetCostAndUsageCommandOutput
}
