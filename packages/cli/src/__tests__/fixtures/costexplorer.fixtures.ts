/*
 * © 2021 Thoughtworks, Inc.
 */

import { CostExplorer } from 'aws-sdk'

const dayOne = '2020-07-01'
const dayTwo = '2020-07-02'
const dayThree = '2020-07-03'

export const lambdaMockGetCostResponse: CostExplorer.GetCostAndUsageResponse = {
  ResultsByTime: [
    {
      TimePeriod: {
        Start: dayOne,
        End: dayTwo,
      },
      Groups: [
        {
          Keys: ['AWS Lambda'],
          Metrics: { AmortizedCost: { Amount: '20.0', Unit: 'USD' } },
        },
        {
          Keys: ['AWS Lambda'],
          Metrics: { AmortizedCost: { Amount: '40.0', Unit: 'USD' } },
        },
      ],
    },
    {
      TimePeriod: {
        Start: dayTwo,
        End: dayThree,
      },
      Groups: [
        {
          Keys: ['AWS Lambda'],
          Metrics: { AmortizedCost: { Amount: '60.0', Unit: 'USD' } },
        },
      ],
    },
  ],
}

export const elastiCacheMockGetUsageResponse: CostExplorer.GetCostAndUsageResponse =
  {
    ResultsByTime: [
      {
        TimePeriod: {
          Start: dayOne,
          End: dayTwo,
        },
        Groups: [
          {
            Keys: ['USE2-NodeUsage:cache.t3.medium'],
            Metrics: {
              UsageQuantity: {
                Amount: '1000',
              },
            },
          },
          {
            Keys: ['USE2-NodeUsage:cache.t2.micro'],
            Metrics: {
              UsageQuantity: {
                Amount: '1000',
              },
            },
          },
        ],
      },
      {
        TimePeriod: {
          Start: dayTwo,
          End: dayThree,
        },
        Groups: [
          {
            Keys: ['USE2-NodeUsage:cache.t3.medium'],
            Metrics: {
              UsageQuantity: {
                Amount: '2000',
              },
            },
          },
        ],
      },
    ],
  }

export const elastiCacheMockGetCostResponse: CostExplorer.GetCostAndUsageResponse =
  {
    ResultsByTime: [
      {
        TimePeriod: {
          Start: dayOne,
          End: dayTwo,
        },
        Groups: [
          {
            Keys: ['USE2-NodeUsage:cache.t3.medium'],
            Metrics: { AmortizedCost: { Amount: '1.0', Unit: 'USD' } },
          },
          {
            Keys: ['USE2-NodeUsage:cache.t2.micro'],
            Metrics: { AmortizedCost: { Amount: '2.0', Unit: 'USD' } },
          },
        ],
      },
      {
        TimePeriod: {
          Start: dayTwo,
          End: dayThree,
        },
        Groups: [
          {
            Keys: ['USE2-NodeUsage:cache.t3.medium'],
            Metrics: { AmortizedCost: { Amount: '3.0', Unit: 'USD' } },
          },
        ],
      },
    ],
  }

export const s3MockGetCostResponse: CostExplorer.GetCostAndUsageResponse = {
  ResultsByTime: [
    {
      TimePeriod: {
        Start: dayOne,
        End: dayTwo,
      },
      Groups: [
        {
          Keys: [''],
          Metrics: { AmortizedCost: { Amount: '1.0', Unit: 'USD' } },
        },
        {
          Keys: ['Amazon Simple Storage Service'],
          Metrics: { AmortizedCost: { Amount: '2.0', Unit: 'USD' } },
        },
      ],
    },
    {
      TimePeriod: {
        Start: dayTwo,
        End: dayThree,
      },
      Groups: [
        {
          Keys: ['Amazon Simple Storage Service'],
          Metrics: { AmortizedCost: { Amount: '3.0', Unit: 'USD' } },
        },
      ],
    },
  ],
}

export const ec2MockGetCostResponse: CostExplorer.GetCostAndUsageResponse = {
  ResultsByTime: [
    {
      TimePeriod: {
        Start: dayOne,
        End: dayTwo,
      },
      Groups: [
        {
          Keys: ['EC2: Running Hours'],
          Metrics: { AmortizedCost: { Amount: '5.0', Unit: 'USD' } },
        },
        {
          Keys: ['EC2: Running Hours'],
          Metrics: { AmortizedCost: { Amount: '2.0', Unit: 'USD' } },
        },
      ],
    },
    {
      TimePeriod: {
        Start: dayTwo,
        End: dayThree,
      },
      Groups: [
        {
          Keys: ['EC2: Running Hours'],
          Metrics: { AmortizedCost: { Amount: '30.0', Unit: 'USD' } },
        },
      ],
    },
  ],
}

export const ebsMockGetUsageResponse: CostExplorer.GetCostAndUsageResponse = {
  ResultsByTime: [
    {
      TimePeriod: {
        End: dayTwo,
        Start: dayOne,
      },
      Groups: [
        {
          Keys: ['EBS:VolumeUsage.piops'],
          Metrics: { UsageQuantity: { Amount: '1000', Unit: 'GB-Month' } },
        },
      ],
    },
    {
      TimePeriod: {
        End: dayThree,
        Start: dayTwo,
      },
      Groups: [
        {
          Keys: ['EBS:VolumeUsage.piops'],
          Metrics: { UsageQuantity: { Amount: '2000', Unit: 'GB-Month' } },
        },
      ],
    },
  ],
}

export const ebsMockGetCostResponse: CostExplorer.GetCostAndUsageResponse = {
  ResultsByTime: [
    {
      TimePeriod: {
        End: dayTwo,
        Start: dayOne,
      },
      Groups: [
        {
          Keys: ['EBS:VolumeUsage.piops'],
          Metrics: { AmortizedCost: { Amount: '2.3081821243', Unit: 'USD' } },
        },
      ],
    },
    {
      TimePeriod: {
        End: dayThree,
        Start: dayTwo,
      },
      Groups: [
        {
          Keys: ['EBS:VolumeUsage.piops'],
          Metrics: { AmortizedCost: { Amount: '2.3081821243', Unit: 'USD' } },
        },
      ],
    },
  ],
}

export const rdsComputeMockGetUsageResponse: CostExplorer.GetCostAndUsageResponse =
  {
    ResultsByTime: [
      {
        TimePeriod: {
          End: dayTwo,
          Start: dayOne,
        },
        Groups: [
          {
            Keys: ['USW1-InstanceUsage:db.t3.medium'],
            Metrics: {
              UsageQuantity: {
                Amount: '1000',
              },
            },
          },
        ],
      },
      {
        TimePeriod: {
          End: dayThree,
          Start: dayTwo,
        },
        Groups: [
          {
            Keys: ['USW1-InstanceUsage:db.r5.24xlarge'],
            Metrics: {
              UsageQuantity: {
                Amount: '1000',
              },
            },
          },
        ],
      },
    ],
  }

export const rdsComputeMockGetCostResponse: CostExplorer.GetCostAndUsageResponse =
  {
    ResultsByTime: [
      {
        TimePeriod: {
          Start: dayOne,
          End: dayTwo,
        },
        Groups: [
          {
            Keys: ['USW1-InstanceUsage:db.t3.medium'],
            Metrics: { AmortizedCost: { Amount: '2.3081821243', Unit: 'USD' } },
          },
        ],
      },
      {
        TimePeriod: {
          Start: dayTwo,
          End: dayThree,
        },
        Groups: [
          {
            Keys: ['USW1-InstanceUsage:db.r5.24xlarge'],
            Metrics: { AmortizedCost: { Amount: '2.3081821243', Unit: 'USD' } },
          },
        ],
      },
    ],
  }

export const rdsStorageMockGetUsageResponse: CostExplorer.GetCostAndUsageResponse =
  {
    ResultsByTime: [
      {
        TimePeriod: {
          Start: dayOne,
          End: dayTwo,
        },
        Groups: [
          {
            Keys: ['USW1-RDS:GP2-Storage'],
            Metrics: {
              UsageQuantity: {
                Amount: '1000',
              },
            },
          },
        ],
      },
      {
        TimePeriod: {
          Start: dayTwo,
          End: dayThree,
        },
        Groups: [
          {
            Keys: ['USW1-RDS:GP2-Storage'],
            Metrics: {
              UsageQuantity: {
                Amount: '1000',
              },
            },
          },
        ],
      },
    ],
  }

export const rdsStorageMockGetCostResponse: CostExplorer.GetCostAndUsageResponse =
  {
    ResultsByTime: [
      {
        TimePeriod: {
          Start: dayOne,
          End: dayTwo,
        },
        Groups: [
          {
            Keys: ['USW1-RDS:GP2-Storage'],
            Metrics: { AmortizedCost: { Amount: '2.3081821243', Unit: 'USD' } },
          },
        ],
      },
      {
        TimePeriod: {
          Start: dayTwo,
          End: dayThree,
        },
        Groups: [
          {
            Keys: ['USW1-RDS:GP2-Storage'],
            Metrics: { AmortizedCost: { Amount: '2.3081821243', Unit: 'USD' } },
          },
        ],
      },
    ],
  }
