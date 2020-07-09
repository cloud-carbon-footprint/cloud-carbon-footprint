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
    const result = await app.controller.ebsEstimate(
        new Date('2020-06-24T00:00:00Z'),
        new Date('2020-06-30T00:00:00Z')
    )

    expect(result).toEqual([
      {
        "co2": 0.0002837210109162789,
        "timestamp": new Date("2020-06-24T00:00:00.000Z"),
        "wattage": 0.40127999959871996
      },
      {
        "co2": 0.00042128271317871734,
        "timestamp": new Date("2020-06-25T00:00:00.000Z"),
        "wattage": 0.5958399994041601
      },
      {
        "co2": 0.0006190276601809724,
        "timestamp": new Date("2020-06-26T00:00:00.000Z"),
        "wattage": 0.87551999912448
      },
      {
        "co2": 0.0009378794460847104,
        "timestamp": new Date("2020-06-27T00:00:00.000Z"),
        "wattage": 1.32648710976
      },
      {
        "co2": 0.0006446962916508176,
        "timestamp": new Date("2020-06-28T00:00:00.000Z"),
        "wattage": 0.9118243545638401
      },
      {
        "co2": 0.0005818764478528676,
        "timestamp": new Date("2020-06-29T00:00:00.000Z"),
        "wattage": 0.8229752883187198
      }
    ])
  })
})
