export function buildCostExplorerGetCostResponse(data: { start: string; amount: number; keys: string[] }[]) {
  return {
    GroupDefinitions: [
      {
        Type: 'DIMENSION',
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
                Amount: amount.toString(),
              },
            },
          },
        ],
      }
    }),
  }
}

export function buildCostExplorerGetUsageResponse(data: { start: string; amount: number; keys: string[] }[]) {
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
                Amount: amount.toString(),
              },
            },
          },
        ],
      }
    }),
  }
}
