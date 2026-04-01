/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import moment from 'moment'
import Chart from 'react-apexcharts'
import ApexLineChart from './ApexLineChart'
import {
  EstimationResult,
  GroupBy,
  ServiceData,
} from '@cloud-carbon-footprint/common'
import { DateRange } from '../../../../Types'

jest.mock('react-apexcharts', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')
  function MockChart(props: Record<string, unknown>) {
    return React.createElement('div', {
      'aria-label': (props['aria-label'] as string) || 'apex-line-chart',
    })
  }
  return { __esModule: true, default: MockChart }
})

jest.mock('../../../../utils/themes')

describe('ApexLineChart', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
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
        periodStartDate: this.timestamp,
        periodEndDate: this.timestamp,
        serviceEstimates: this.serviceEstimates,
        groupBy: GroupBy.day,
      }
    }
  }

  const setDateRangeSpy = jest.fn()
  const setChartDataSpy = jest.fn()
  const setDefaultDateRangeSpy = jest.fn()
  const setToggledSeriesSpy = jest.fn()
  // Use this function to mock the component's state, and pass any initial values you'd want to override for a specific test
  const mockUseState = (
    initialDateRange: DateRange = { min: null, max: null },
    initialChartData: EstimationResult[] = [],
    initialDefaultDateRange: DateRange = { min: null, max: null },
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

  it('should mark kilowatt hours and cost series hidden on initial data load', () => {
    const testRenderer = create(
      <ApexLineChart
        data={[
          new EstimationResultBuilder()
            .withTime(new Date('2019-08-10T00:00:00.000Z'))
            .build(),
        ]}
      />,
    )
    const ser = testRenderer.root.findByType(Chart)?.props?.series
    expect(ser[0].hidden).toBe(false)
    expect(ser[1].hidden).toBe(true)
    expect(ser[2].hidden).toBe(true)
  })

  it('should not hide any series when all legends are enabled', () => {
    mockUseState({ min: null, max: null }, [], { min: null, max: null }, [
      { CO2e: true },
      { 'Kilowatt Hours': true },
      { Cost: true },
    ])

    const testRenderer = create(
      <ApexLineChart
        data={[
          new EstimationResultBuilder()
            .withTime(new Date('2019-08-10T00:00:00.000Z'))
            .build(),
        ]}
      />,
    )
    const ser = testRenderer.root.findByType(Chart)?.props?.series
    expect(ser[0].hidden).toBe(false)
    expect(ser[1].hidden).toBe(false)
    expect(ser[2].hidden).toBe(false)
  })

  it('should hide all series when all legends are disabled', () => {
    mockUseState({ min: null, max: null }, [], { min: null, max: null }, [
      { CO2e: false },
      { 'Kilowatt Hours': false },
      { Cost: false },
    ])

    const testRenderer = create(
      <ApexLineChart
        data={[
          new EstimationResultBuilder()
            .withTime(new Date('2019-08-10T00:00:00.000Z'))
            .build(),
        ]}
      />,
    )
    const ser = testRenderer.root.findByType(Chart)?.props?.series
    expect(ser[0].hidden).toBe(true)
    expect(ser[1].hidden).toBe(true)
    expect(ser[2].hidden).toBe(true)
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
        hidden: false,
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
        hidden: true,
        data: [
          {
            x: new Date('2019-08-10T00:00:00.000Z'),
            y: 12,
          },
        ],
      },
      {
        name: 'Cost',
        hidden: true,
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
    setDateRangeSpy.mockClear()
    mockUseState()

    act(() => {
      create(<ApexLineChart data={[new EstimationResultBuilder().build()]} />)
    })

    expect(setDateRangeSpy).toHaveBeenCalledTimes(1)
  })

  it('should not reset date range when default range is unchanged', () => {
    setDateRangeSpy.mockClear()
    setDefaultDateRangeSpy.mockClear()
    mockUseState(
      {
        min: new Date('2019-08-10T00:00:00.000Z'),
        max: new Date('2019-08-11T00:00:00.000Z'),
      },
      [],
      {
        min: new Date('2019-08-10T00:00:00.000Z'),
        max: new Date('2019-08-11T00:00:00.000Z'),
      },
    )

    act(() => {
      create(
        <ApexLineChart
          data={[
            new EstimationResultBuilder()
              .withTime(new Date('2019-08-10T00:00:00.000Z'))
              .build(),
          ]}
        />,
      )
    })

    expect(setDateRangeSpy).not.toHaveBeenCalled()
    expect(setDefaultDateRangeSpy).not.toHaveBeenCalled()
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
          hidden: false,
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
          hidden: true,
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
          hidden: true,
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

  it('should keep at least one legend series visible', () => {
    mockUseState({ min: null, max: null }, [], { min: null, max: null }, [
      { CO2e: true },
      { 'Kilowatt Hours': false },
      { Cost: false },
    ])

    let testRenderer: ReactTestRenderer
    act(() => {
      testRenderer = create(<ApexLineChart data={[]} />)
    })

    act(() => {
      const afterLegendClickCallback =
        testRenderer.root?.findByType(Chart)?.props?.options?.chart?.events
          ?.legendClick

      expect(afterLegendClickCallback).toBeDefined()
      afterLegendClickCallback(undefined, 0)
    })

    expect(setToggledSeriesSpy).toHaveBeenNthCalledWith(1, [
      { CO2e: false },
      { 'Kilowatt Hours': false },
      { Cost: false },
    ])
    expect(setToggledSeriesSpy).toHaveBeenNthCalledWith(2, [
      { CO2e: true },
      { 'Kilowatt Hours': false },
      { Cost: false },
    ])
  })

  it('should format x-axis labels using day grouping format', () => {
    const testRenderer = create(
      <ApexLineChart
        data={[
          new EstimationResultBuilder()
            .withTime(new Date('2019-08-10T00:00:00.000Z'))
            .build(),
        ]}
      />,
    )
    const formatter =
      testRenderer.root?.findByType(Chart)?.props?.options?.xaxis?.labels
        ?.formatter

    expect(formatter).toBeDefined()
    expect(formatter('2019-08-10T00:00:00.000Z')).toEqual('Aug 11, 2019')
  })
})
