/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React from 'react'
import {
  create,
  ReactTestInstance,
  ReactTestRenderer,
} from 'react-test-renderer'

import { EmissionsBreakdownContainer } from './EmissionsBreakdownContainer'
import { Select } from '@material-ui/core'
import { act, fireEvent, render, RenderResult } from '@testing-library/react'
import { ApexBarChart } from './ApexBarChart'
jest.mock('../../themes')

describe('EmissionsBreakdownContainer', () => {
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
    testRenderer = create(
      <EmissionsBreakdownContainer data={dataWithHigherPrecision} />,
    )
    testInstance = testRenderer.root
    page = render(
      <EmissionsBreakdownContainer data={dataWithHigherPrecision} />,
    )
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

  it('checks to see if bar chart exists upon loading', () => {
    const isApexDonutChartRendered = testInstance.findAllByType(ApexBarChart)

    expect(isApexDonutChartRendered).toHaveLength(1)
  })

  it('renders emission by region donut chart by default', () => {
    const isApexDonutChartRendered = testInstance.findByType(ApexBarChart)

    expect(isApexDonutChartRendered.props.dataType).toBe('region')
  })

  it('selects the correct option', () => {
    act(() => {
      fireEvent.mouseDown(page.getByRole('button', { name: 'Region' }))
    })

    expect(page.getByRole('option', { name: 'Region' })).toHaveClass(
      'MuiListItem-button',
    )
    expect(page.getByRole('option', { name: 'Account' })).toHaveClass(
      'MuiListItem-button',
    )
    expect(page.getByRole('option', { name: 'Service' })).toHaveClass(
      'MuiListItem-button',
    )
  })
})
