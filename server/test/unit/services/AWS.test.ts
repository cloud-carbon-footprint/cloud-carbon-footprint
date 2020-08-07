import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import { getUsageFromCostExplorer, DiskType, VolumeUsage } from '@services/StorageUsageMapper'

beforeAll(() => {
  AWS.config.update({ region: 'us-east-1' })
  AWSMock.setSDKInstance(AWS)
})

describe('aws service helper', () => {
  const mockFunction = jest.fn()
  mockFunction
    .mockReturnValueOnce(
      buildAwsCostExplorerGetCostAndUsageResponse(
        [{ start: '2020-06-27', value: '1.2120679', types: ['EBS:VolumeUsage.gp2'] }],
        'tokenToNextPage',
      ),
    )
    .mockReturnValueOnce(
      buildAwsCostExplorerGetCostAndUsageResponse(
        [{ start: '2020-06-28', value: '1.2120679', types: ['EBS:VolumeUsage.gp2'] }],
        null,
      ),
    )

  afterEach(() => {
    AWSMock.restore()
    jest.restoreAllMocks()
  })

  it('should follow next page tokens in GetCostAndUsage response', async () => {
    const params = {
      TimePeriod: {
        Start: '2019-08-06',
        End: '2020-08-06',
      },
      Granularity: 'DAILY',
      Metrics: [
        'AmortizedCost',
        'BlendedCost',
        'NetAmortizedCost',
        'NetUnblendedCost',
        'NormalizedUsageAmount',
        'UnblendedCost',
        'UsageQuantity',
      ],
      GroupBy: [
        {
          Key: 'USAGE_TYPE',
          Type: 'DIMENSION',
        },
      ],
    }
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (request: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, mockFunction())
      },
    )
    const res: VolumeUsage[] = await getUsageFromCostExplorer(params, () => DiskType.SSD)

    expect(res).toEqual([
      { diskType: 'SSD', sizeGb: 36.362037, timestamp: new Date('2020-06-27T00:00:00.000Z') },
      { diskType: 'SSD', sizeGb: 36.362037, timestamp: new Date('2020-06-28T00:00:00.000Z') },
    ])
  })
})

function buildAwsCostExplorerGetCostAndUsageResponse(
  data: { start: string; value: string; types: string[] }[],
  nextPageToken: string,
) {
  return {
    NextPageToken: nextPageToken,
    GroupDefinitions: [
      {
        Type: 'DIMENSION',
        Key: 'USAGE_TYPE',
      },
    ],
    ResultsByTime: data.map(({ start, value, types }) => {
      return {
        TimePeriod: {
          Start: start,
        },
        Groups: [
          {
            Keys: types,
            Metrics: { UsageQuantity: { Amount: value, Unit: 'GB-Month' } },
          },
        ],
      }
    }),
  }
}
