import AwsClient from './AwsClient'
jest.mock('./AwsClient')

import Controller from './Controller'

describe('controller', () => {
  it('estimates ebs usage', async () => {
    const client = new AwsClient(null)
    const controller = new Controller('beep boop', client)

    const result = await controller.ebsEstimate(new Date(), new Date())

    expect(result).toEqual([
      {
        co2: 0.0009378794460847104,
        timestamp: new Date('2020-06-27T00:00:00.000Z'),
        wattage: 1.32648710976
      },
      {
        co2: 0.0006446962916508176,
        timestamp: new Date('2020-06-28T00:00:00.000Z'),
        wattage: 0.9118243545638401
      },
      {
        co2: 0.0005818764478528676,
        timestamp: new Date('2020-06-29T00:00:00.000Z'),
        wattage: 0.8229752883187198
      }
    ])
  })
})
