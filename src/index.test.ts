import createApp, { App } from './index'
import Controller from './controller'

describe('App', () => {
  let app: App

  beforeEach(() => {
    app = createApp()
  })
  it('should have a Controller', () => {
    expect(app.controller).toBeInstanceOf(Controller)
  })

  // actually calls AWS api, will fail if creds arent setup
  it('should calculate ebs usage based on AWS query', async () => {
    const result = await app.controller.productionReady()

    expect(result).toEqual('1.2120679')
  })
})
