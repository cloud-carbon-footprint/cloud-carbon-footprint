import AwsClient from './AwsClient'
jest.mock('./AwsClient')

import Controller from './Controller'

describe('controller', () => {
  it('do', async () => {
    const client = new AwsClient(null)
    const controller = new Controller('beep boop', client)

    const result = await controller.productionReady()

    expect(result).toEqual('1.2120679')
  })
})
