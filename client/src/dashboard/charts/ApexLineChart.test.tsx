/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import moment from 'moment'

import { ApexLineChart } from './ApexLineChart'
import { render } from '@testing-library/react'
import ApexCharts from 'apexcharts'
import Chart from 'react-apexcharts'

jest.mock('../../themes')
describe('ApexLineChart', () => {
  class EstimationResultBuilder {
    private timestamp = moment('2019-08-10T00:00:00.000Z').toDate()
    private serviceEstimates = [
      {
        cloudProvider: 'AWS',
        accountName: 'account-1',
        serviceName: 'ebs',
        wattHours: 2,
        co2e: 5,
        cost: 3,
        region: 'us-west-2',
      },
      {
        cloudProvider: 'AWS',
        accountName: 'account-1',
        serviceName: 's3',
        wattHours: 4,
        co2e: 10,
        cost: 6,
        region: 'us-west-2',
      },
      {
        cloudProvider: 'AWS',
        accountName: 'account-1',
        serviceName: 'ec2',
        wattHours: 6,
        co2e: 15,
        cost: 9,
        region: 'us-west-2',
      },
    ]

    withTime(time: Date) {
      this.timestamp = time
      return this
    }

    build() {
      return {
        timestamp: this.timestamp,
        serviceEstimates: this.serviceEstimates,
      }
    }
  }

  it('renders with correct configuration', () => {
    const root = create(
      <ApexLineChart data={[new EstimationResultBuilder().withTime(new Date('2019-08-10T00:00:00.000Z')).build()]} />,
    )
    expect(root.toJSON()).toMatchSnapshot()
  })

  it('should manually disable watt hours and cost series on initial data load', () => {
    render(
      <ApexLineChart data={[new EstimationResultBuilder().withTime(new Date('2019-08-10T00:00:00.000Z')).build()]} />,
    )
    expect(ApexCharts.exec).toHaveBeenCalledWith('lineChart', 'hideSeries', ['Cost'])
    expect(ApexCharts.exec).toHaveBeenCalledWith('lineChart', 'hideSeries', ['Watt Hours'])
  })

  it('should update chart with new data and default max values on props data change', () => {
    const testRenderer = create(<ApexLineChart data={[]} />)
    act(() => {
      testRenderer.update(<ApexLineChart data={[new EstimationResultBuilder().build()]} />)
    })
    const filteredSeries = testRenderer.root.findByType(Chart)?.props?.series
    expect(filteredSeries).toBeDefined()
    expect(filteredSeries).toEqual([
      {
        name: 'CO2e',
        data: [
          {
            x: new Date('2019-08-10T00:00:00.000Z'),
            y: 30,
            usesAverageCPUConstant: false,
            cost: 18,
            wattHours: 12,
          },
        ],
      },
      {
        name: 'Watt Hours',
        data: [
          {
            x: new Date('2019-08-10T00:00:00.000Z'),
            y: 12,
          },
        ],
      },
      {
        name: 'Cost',
        data: [
          {
            x: new Date('2019-08-10T00:00:00.000Z'),
            y: 18,
          },
        ],
      },
    ])
  })

  it('should set date range when data actually provided', () => {
    const setDateRangeSpy = jest.fn()
    const setChartDataSpy = jest.fn()
    const setDefaultDateRangeSpy = jest.fn()
    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([{ min: null, max: null }, setDateRangeSpy])
      .mockReturnValueOnce([[], setChartDataSpy])
      .mockReturnValueOnce([{ min: null, max: null }, setDefaultDateRangeSpy])
      .mockReturnValueOnce([[{ CO2e: true }, { 'Watt Hours': false }, { Cost: false }], jest.fn()])

    act(() => {
      create(<ApexLineChart data={[new EstimationResultBuilder().build()]} />)
    })

    expect(setDateRangeSpy).toHaveBeenCalledTimes(1)
  })

  it('should set date range default (within the prev week) when data not provided', () => {
    const setDateRangeSpy = jest.fn()
    const setChartDataSpy = jest.fn()
    const setDefaultDateRangeSpy = jest.fn()
    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([{ min: null, max: null }, setDateRangeSpy])
      .mockReturnValueOnce([[], setChartDataSpy])
      .mockReturnValueOnce([{ min: null, max: null }, setDefaultDateRangeSpy])
      .mockReturnValueOnce([[{ CO2e: true }, { 'Watt Hours': false }, { Cost: false }], jest.fn()])

    act(() => {
      create(<ApexLineChart data={[]} />)
    })

    expect(setDateRangeSpy).toHaveBeenCalledTimes(1)
  })

  it('should set date range state when zooming through apex line chart', () => {
    const setDateRangeSpy = jest.fn()
    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([{ min: null, max: null }, setDateRangeSpy])
      .mockReturnValueOnce([[], jest.fn()])
      .mockReturnValueOnce([{ min: null, max: null }, jest.fn()])
      .mockReturnValueOnce([[{ CO2e: true }, { 'Watt Hours': false }, { Cost: false }], jest.fn()])

    let testRenderer: ReactTestRenderer
    act(() => {
      testRenderer = create(<ApexLineChart data={[]} />)
    })

    act(() => {
      const afterZoomCallback = testRenderer.root?.findByType(Chart)?.props?.options?.chart?.events?.zoomed

      expect(afterZoomCallback).toBeDefined()
      afterZoomCallback(undefined, {
        xaxis: { min: new Date('2019-01-10T00:00:00.000Z'), max: new Date('2019-08-10T00:00:00.000Z') },
      })
    })

    expect(setDateRangeSpy).toHaveBeenCalledWith({
      min: new Date('2019-01-10T00:00:00.000Z'),
      max: new Date('2019-08-10T00:00:00.000Z'),
    })
  })

  it('should set the current default range state when resetting zoom through apex charts', () => {
    const setDateRangeSpy = jest.fn()
    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([{ min: null, max: null }, setDateRangeSpy])
      .mockReturnValueOnce([[], jest.fn()])
      .mockReturnValueOnce([{ min: null, max: null }, jest.fn()])
      .mockReturnValueOnce([[{ CO2e: true }, { 'Watt Hours': false }, { Cost: false }], jest.fn()])

    let testRenderer: ReactTestRenderer
    act(() => {
      testRenderer = create(<ApexLineChart data={[]} />)
    })

    expect(setDateRangeSpy).toHaveBeenCalledTimes(1)

    act(() => {
      const beforeResetZoomCallback = testRenderer.root?.findByType(Chart)?.props?.options?.chart?.events
        ?.beforeResetZoom

      expect(beforeResetZoomCallback).toBeDefined()
      beforeResetZoomCallback()
    })

    expect(setDateRangeSpy).toHaveBeenCalledTimes(2)
    expect(setDateRangeSpy).toHaveBeenLastCalledWith(setDateRangeSpy.mock.calls[0][0])
  })

  it('should update data based on new ranges', () => {
    const newDateRange = { min: new Date('2019-07-10T00:00:00.000Z'), max: new Date('2019-11-10T00:00:00.000Z') }
    const defaultDateRange = { min: new Date('2019-06-10T00:00:00.000Z'), max: new Date('2019-12-10T00:00:00.000Z') }
    const initialData = [
      new EstimationResultBuilder().withTime(new Date('2019-06-10T00:00:00.000Z')).build(),
      new EstimationResultBuilder().withTime(new Date('2019-08-10T00:00:00.000Z')).build(),
      new EstimationResultBuilder().withTime(new Date('2019-10-10T00:00:00.000Z')).build(),
      new EstimationResultBuilder().withTime(new Date('2019-12-10T00:00:00.000Z')).build(),
    ]

    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([newDateRange, jest.fn()])
      .mockReturnValueOnce([initialData, jest.fn()])
      .mockReturnValueOnce([defaultDateRange, jest.fn()])
      .mockReturnValueOnce([[{ CO2e: true }, { 'Watt Hours': false }, { Cost: false }], jest.fn()])

    let testRenderer: ReactTestRenderer
    act(() => {
      testRenderer = create(<ApexLineChart data={initialData} />)
    })

    act(() => {
      const filteredSeries = testRenderer.root?.findByType(Chart)?.props?.series
      expect(filteredSeries).toBeDefined()
      expect(filteredSeries).toEqual([
        {
          name: 'CO2e',
          data: [
            {
              x: new Date('2019-08-10T00:00:00.000Z'),
              y: 30,
              usesAverageCPUConstant: false,
              cost: 18,
              wattHours: 12,
            },
            {
              x: new Date('2019-10-10T00:00:00.000Z'),
              y: 30,
              usesAverageCPUConstant: false,
              cost: 18,
              wattHours: 12,
            },
          ],
        },
        {
          name: 'Watt Hours',
          data: [
            {
              x: new Date('2019-08-10T00:00:00.000Z'),
              y: 12,
            },
            {
              x: new Date('2019-10-10T00:00:00.000Z'),
              y: 12,
            },
          ],
        },
        {
          name: 'Cost',
          data: [
            {
              x: new Date('2019-08-10T00:00:00.000Z'),
              y: 18,
            },
            {
              x: new Date('2019-10-10T00:00:00.000Z'),
              y: 18,
            },
          ],
        },
      ])
    })
  })

  it('should update toggle series state when a series is clicked in the legend', () => {
    const setLegendToggleSpy = jest.fn()
    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([{ min: null, max: null }, jest.fn()])
      .mockReturnValueOnce([[], jest.fn()])
      .mockReturnValueOnce([{ min: null, max: null }, jest.fn()])
      .mockReturnValueOnce([[{ CO2e: true }, { 'Watt Hours': false }, { Cost: false }], setLegendToggleSpy])

    let testRenderer: ReactTestRenderer
    act(() => {
      testRenderer = create(<ApexLineChart data={[]} />)
    })

    act(() => {
      const afterLegendClickCallback = testRenderer.root?.findByType(Chart)?.props?.options?.chart?.events?.legendClick

      expect(afterLegendClickCallback).toBeDefined()
      afterLegendClickCallback(undefined, 1)
    })

    expect(setLegendToggleSpy).toHaveBeenCalledWith([{ CO2e: true }, { 'Watt Hours': true }, { Cost: false }])
  })
})
