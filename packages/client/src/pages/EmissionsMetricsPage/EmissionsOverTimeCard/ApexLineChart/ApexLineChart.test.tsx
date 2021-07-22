/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import moment from 'moment'
import ApexCharts from 'apexcharts'
import Chart from 'react-apexcharts'
import { render } from '@testing-library/react'
import ApexLineChart from './ApexLineChart'
import { ServiceData } from '@cloud-carbon-footprint/common'

jest.mock('apexcharts')
jest.mock('utils/themes')

describe('ApexLineChart', () => {
  class EstimationResultBuilder {
    private timestamp = moment('2019-08-10T00:00:00.000Z').toDate()
    private serviceEstimates: ServiceData[] = [
      {
        cloudProvider: 'AWS',
        accountId: 'account-1-id',
        accountName: 'account-1',
        serviceName: 'ebs',
        kilowattHours: 2,
        co2e: 5,
        cost: 3,
        region: 'us-west-2',
      },
      {
        cloudProvider: 'AWS',
        accountId: 'account-1-id',
        accountName: 'account-1',
        serviceName: 's3',
        kilowattHours: 4,
        co2e: 10,
        cost: 6,
        region: 'us-west-2',
      },
      {
        cloudProvider: 'AWS',
        accountId: 'account-1-id',
        accountName: 'account-1',
        serviceName: 'ec2',
        kilowattHours: 6,
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

  const setDateRangeSpy = jest.fn()
  const setChartDataSpy = jest.fn()
  const setDefaultDateRangeSpy = jest.fn()
  const setToggledSeriesSpy = jest.fn()
  // Use this function to mock the component's state, and pass any initial values you'd want to override for a specific test
  const mockUseState = (
    initialDateRange = { min: null, max: null },
    initialChartData = [],
    initialDefaultDateRange = { min: null, max: null },
    initialToggledSeries = [
      { CO2e: true },
      { 'Kilowatt Hours': false },
      { Cost: false },
    ],
  ) => {
    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([initialDateRange, setDateRangeSpy])
      .mockReturnValueOnce([initialChartData, setChartDataSpy])
      .mockReturnValueOnce([initialDefaultDateRange, setDefaultDateRangeSpy])
      .mockReturnValueOnce([initialToggledSeries, setToggledSeriesSpy])
  }

  it('renders with correct configuration', () => {
    const root = create(
      <ApexLineChart
        data={[
          new EstimationResultBuilder()
            .withTime(new Date('2019-08-10T00:00:00.000Z'))
            .build(),
        ]}
      />,
    )
    expect(root.toJSON()).toMatchSnapshot()
  })

  it('should manually disable kilowatt hours and cost series on initial data load', () => {
    render(
      <ApexLineChart
        data={[
          new EstimationResultBuilder()
            .withTime(new Date('2019-08-10T00:00:00.000Z'))
            .build(),
        ]}
      />,
    )
    expect(ApexCharts.exec).toHaveBeenCalledWith('lineChart', 'hideSeries', [
      'Cost',
    ])
    expect(ApexCharts.exec).toHaveBeenCalledWith('lineChart', 'hideSeries', [
      'Kilowatt Hours',
    ])
  })

  it('should update chart with new data and default max values on props data change', () => {
    const testRenderer = create(<ApexLineChart data={[]} />)
    act(() => {
      testRenderer.update(
        <ApexLineChart data={[new EstimationResultBuilder().build()]} />,
      )
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
            kilowattHours: 12,
          },
        ],
      },
      {
        name: 'Kilowatt Hours',
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
    mockUseState()

    act(() => {
      create(<ApexLineChart data={[new EstimationResultBuilder().build()]} />)
    })

    expect(setDateRangeSpy).toHaveBeenCalledTimes(1)
  })

  it('should not set date range state when zooming with apex line chart and less than two filtered items are within the range', () => {
    mockUseState()

    let testRenderer: ReactTestRenderer
    act(() => {
      testRenderer = create(<ApexLineChart data={[]} />)
    })

    act(() => {
      const beforeZoomCallback =
        testRenderer.root?.findByType(Chart)?.props?.options?.chart?.events
          ?.beforeZoom

      expect(beforeZoomCallback).toBeDefined()
      beforeZoomCallback(undefined, {
        xaxis: {
          min: new Date('2019-01-10T00:00:00.000Z'),
          max: new Date('2019-08-10T00:00:00.000Z'),
        },
      })
    })

    expect(setDateRangeSpy).not.toHaveBeenCalled()
  })

  it('should set date range state when zooming with apex line chart and at least two filtered items are within the range', () => {
    mockUseState()

    let testRenderer: ReactTestRenderer
    act(() => {
      testRenderer = create(
        <ApexLineChart
          data={[
            new EstimationResultBuilder()
              .withTime(new Date('2019-05-10T00:00:00.000Z'))
              .build(),
            new EstimationResultBuilder()
              .withTime(new Date('2019-06-10T00:00:00.000Z'))
              .build(),
          ]}
        />,
      )
    })

    act(() => {
      const beforeZoomCallback =
        testRenderer.root?.findByType(Chart)?.props?.options?.chart?.events
          ?.beforeZoom

      expect(beforeZoomCallback).toBeDefined()
      beforeZoomCallback(undefined, {
        xaxis: {
          min: new Date('2019-01-10T00:00:00.000Z'),
          max: new Date('2019-08-10T00:00:00.000Z'),
        },
      })
    })

    expect(setDateRangeSpy).toHaveBeenCalledWith({
      min: new Date('2019-01-10T00:00:00.000Z'),
      max: new Date('2019-08-10T00:00:00.000Z'),
    })
  })

  it('should set the current default range state when resetting zoom through apex charts', () => {
    mockUseState(undefined, undefined, {
      min: new Date('2019-07-10T00:00:00.000Z'),
      max: new Date('2019-11-10T00:00:00.000Z'),
    })

    let testRenderer: ReactTestRenderer
    act(() => {
      testRenderer = create(<ApexLineChart data={[]} />)
    })

    act(() => {
      const beforeResetZoomCallback =
        testRenderer.root?.findByType(Chart)?.props?.options?.chart?.events
          ?.beforeResetZoom

      expect(beforeResetZoomCallback).toBeDefined()
      beforeResetZoomCallback()
    })

    expect(setDateRangeSpy).toHaveBeenCalledTimes(1)
    expect(setDateRangeSpy).toHaveBeenLastCalledWith({
      min: new Date('2019-07-10T00:00:00.000Z'),
      max: new Date('2019-11-10T00:00:00.000Z'),
    })
  })

  it('should update data based on new ranges', () => {
    const newDateRange = {
      min: new Date('2019-07-10T00:00:00.000Z'),
      max: new Date('2019-11-10T00:00:00.000Z'),
    }
    const defaultDateRange = {
      min: new Date('2019-06-10T00:00:00.000Z'),
      max: new Date('2019-12-10T00:00:00.000Z'),
    }
    const initialData = [
      new EstimationResultBuilder()
        .withTime(new Date('2019-06-10T00:00:00.000Z'))
        .build(),
      new EstimationResultBuilder()
        .withTime(new Date('2019-08-10T00:00:00.000Z'))
        .build(),
      new EstimationResultBuilder()
        .withTime(new Date('2019-10-10T00:00:00.000Z'))
        .build(),
      new EstimationResultBuilder()
        .withTime(new Date('2019-12-10T00:00:00.000Z'))
        .build(),
    ]

    mockUseState(newDateRange, initialData, defaultDateRange)

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
              kilowattHours: 12,
            },
            {
              x: new Date('2019-10-10T00:00:00.000Z'),
              y: 30,
              usesAverageCPUConstant: false,
              cost: 18,
              kilowattHours: 12,
            },
          ],
        },
        {
          name: 'Kilowatt Hours',
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
    mockUseState()

    let testRenderer: ReactTestRenderer
    act(() => {
      testRenderer = create(<ApexLineChart data={[]} />)
    })

    act(() => {
      const afterLegendClickCallback =
        testRenderer.root?.findByType(Chart)?.props?.options?.chart?.events
          ?.legendClick

      expect(afterLegendClickCallback).toBeDefined()
      afterLegendClickCallback(undefined, 1)
    })

    expect(setToggledSeriesSpy).toHaveBeenCalledWith([
      { CO2e: true },
      { 'Kilowatt Hours': true },
      { Cost: false },
    ])
  })
})
