/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React from 'react'
import { create, ReactTestInstance, ReactTestRenderer } from 'react-test-renderer'

import { DonutChartTabs } from './DonutChartTabs'
import { Tab } from '@material-ui/core'
import { ApexDonutChart } from './ApexDonutChart'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { ChartDataTypes } from '../../models/types'

jest.mock('../../themes')

describe('DonutChartTabs', () => {
  const date1 = new Date('2020-07-10T00:00:00.000Z')
  const date2 = new Date('2020-07-11T00:00:00.000Z')

  let testRenderer: ReactTestRenderer, testInstance: ReactTestInstance

  const dataWithHigherPrecision = [
    {
      timestamp: date1,
      serviceEstimates: [
        {
          timestamp: date1,
          serviceName: 'ebs',
          wattHours: 12.2342,
          co2e: 15.12341,
          cost: 5.82572,
          region: 'us-east-1',
          usesAverageCPUConstant: false,
        },
        {
          timestamp: date1,
          serviceName: 'ec2',
          wattHours: 4.745634,
          co2e: 5.234236,
          cost: 4.732,
          region: 'us-east-1',
          usesAverageCPUConstant: false,
        },
      ],
    },
    {
      timestamp: date2,
      serviceEstimates: [
        {
          timestamp: date2,
          serviceName: 'ebs',
          wattHours: 25.73446,
          co2e: 3.2600234,
          cost: 6.05931,
          region: 'us-east-1',
          usesAverageCPUConstant: false,
        },
        {
          timestamp: date2,
          serviceName: 'ec2',
          wattHours: 2.4523452,
          co2e: 7.7536,
          cost: 6.2323,
          region: 'us-east-1',
          usesAverageCPUConstant: true,
        },
      ],
    },
  ]

  beforeEach(() => {
    testRenderer = create(<DonutChartTabs data={dataWithHigherPrecision} />)
    testInstance = testRenderer.root
  })

  it('renders donut chart with three tabs', () => {
    const allTabInstancesList = testInstance.findAllByType(Tab)

    expect(allTabInstancesList).toHaveLength(3)

    allTabInstancesList.forEach((tab) => {
      expect(['Emissions By Region', 'By Account', 'By Service'].includes(tab.props.label)).toBe(true)
    })

    expect(testInstance.findAllByType(Tab))

    expect(testRenderer.toJSON()).toMatchSnapshot()
  })

  it('checks to see if donut chart exists upon loading', () => {
    const isApexDonutChartRendered = testInstance.findAllByType(ApexDonutChart)

    expect(isApexDonutChartRendered).toHaveLength(1)
  })

  it('renders emission by region donut chart by default', () => {
    const isApexDonutChartRendered = testInstance.findByType(ApexDonutChart)

    expect(isApexDonutChartRendered.props.dataType).toBe('region')
  })
  it('renders emission by service donut chart when service tab clicked', async () => {
    const { getByText, getByTestId } = render(<DonutChartTabs data={dataWithHigherPrecision} />)
    const apexDonutChartByRegion = getByTestId(ChartDataTypes.REGION)

    expect(apexDonutChartByRegion).toBeVisible()

    act(() => {
      fireEvent.click(getByText('By Service'))
    })

    const apexDonutChartByService = getByTestId(ChartDataTypes.SERVICE)
    expect(apexDonutChartByService).toBeVisible()
  })
  it('renders emission by account donut chart when account tab clicked', async () => {
    const { getByText, getByTestId } = render(<DonutChartTabs data={dataWithHigherPrecision} />)
    const apexDonutChartByRegion = getByTestId(ChartDataTypes.REGION)

    expect(apexDonutChartByRegion).toBeVisible()

    act(() => {
      fireEvent.click(getByText('By Account'))
    })

    const apexDonutChartByAccount = getByTestId(ChartDataTypes.ACCOUNT)
    expect(apexDonutChartByAccount).toBeVisible()
  })
})
