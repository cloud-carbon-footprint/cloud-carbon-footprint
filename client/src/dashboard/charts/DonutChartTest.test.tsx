/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React from 'react'
import { create, ReactTestInstance, ReactTestRenderer } from 'react-test-renderer'

import { DonutChart } from './DonutChart'
import { ApexDonutChart } from './ApexDonutChart'
import { Select } from '@material-ui/core'
import { act, fireEvent, render, RenderResult } from '@testing-library/react'
jest.mock('../../themes')

describe('DonutChartTabs', () => {
  const date1 = new Date('2020-07-10T00:00:00.000Z')
  const date2 = new Date('2020-07-11T00:00:00.000Z')
  let page: RenderResult
  let testRenderer: ReactTestRenderer, testInstance: ReactTestInstance

  const dataWithHigherPrecision = [
    {
      timestamp: date1,
      serviceEstimates: [
        {
          cloudProvider: 'aws',
          accountName: 'testacct',
          serviceName: 'ebs',
          wattHours: 12.2342,
          co2e: 15.12341,
          cost: 5.82572,
          region: 'us-east-1',
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountName: 'testacct',
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
          cloudProvider: 'aws',
          accountName: 'testacct',
          serviceName: 'ebs',
          wattHours: 25.73446,
          co2e: 3.2600234,
          cost: 6.05931,
          region: 'us-east-1',
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountName: 'testacct',
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
    testRenderer = create(<DonutChart data={dataWithHigherPrecision} />)
    testInstance = testRenderer.root
    page = render(<DonutChart data={dataWithHigherPrecision} />)
  })

  afterEach(() => {
    page.unmount()
  })

  it('renders donut chart with dropdown', () => {
    //emulate click to test
    const allMenuItemInstancesList = testInstance.findAllByType(Select)

    expect(allMenuItemInstancesList).toHaveLength(1)

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

  it('selects the correct option', () => {
    let regionIsAnMuiListItemButton = false
    act(() => {
      fireEvent.mouseDown(page.getByRole('button'))
    })
    page.getAllByText('Region').forEach((regionComponent) => {
      regionComponent.className.includes('MuiListItem-button') ? (regionIsAnMuiListItemButton = true) : null
    })

    expect(regionIsAnMuiListItemButton).toBeTruthy()
    expect(page.getByText('Account')).toHaveClass('MuiListItem-button')
    expect(page.getByText('Service')).toHaveClass('MuiListItem-button')
  })
})
