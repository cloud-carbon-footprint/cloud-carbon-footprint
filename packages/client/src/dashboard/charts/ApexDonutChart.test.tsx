/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { act, create, ReactTestRenderer } from 'react-test-renderer'
import { EstimationResult } from '../../models/types'
import moment from 'moment'
import React from 'react'
import { ApexBarChart, Entry } from './ApexBarChart'
import { Page, Pagination } from './Pagination'
import Chart from 'react-apexcharts'

describe('ApexBarChart', () => {
  let fixture: ReactTestRenderer
  const data: EstimationResult[] = [
    {
      timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
      serviceEstimates: [
        {
          cloudProvider: 'AWS',
          accountName: 'some account',
          serviceName: 'ebs',
          kilowattHours: 0,
          co2e: 3000.014,
          cost: 0,
          region: 'us-west-2',
        },
        {
          cloudProvider: 'AWS',
          accountName: 'some account',
          serviceName: 's3',
          kilowattHours: 0,
          co2e: 1000.014,
          cost: 0,
          region: 'us-west-2',
        },
        {
          cloudProvider: 'AWS',
          accountName: 'some account',
          serviceName: 'ec2',
          kilowattHours: 0,
          co2e: 2000.014,
          cost: 0,
          region: 'us-west-2',
        },
        {
          cloudProvider: 'AWS',
          accountName: 'some account',
          serviceName: 'eks',
          kilowattHours: 0,
          co2e: 0.000014,
          cost: 0,
          region: 'us-west-2',
        },
      ],
    },
  ]
  beforeEach(() => {
    fixture = create(<ApexBarChart data={data} dataType="service" />)
  })
  it('renders with correct configuration', () => {
    expect(fixture.toJSON()).toMatchSnapshot()
  })

  it.skip('should format tool tip values with proper data instead of scaled down data', () => {
    act(() => {
      const handlePage: (page: Page<Entry>) => void = fixture.root.findByType(
        Pagination,
      ).props?.handlePage
      // make pagination send first page
      handlePage({
        data: [
          { x: 'ebs', y: 100 },
          { x: 'ec2', y: 67.00015384528277 },
          { x: 's3', y: 34.00030769056555 },
          { x: 'eks', y: 1 },
        ],
        page: 0,
      })
    })

    const yFormatter = fixture.root.findByType(Chart).props?.options?.tooltip?.y
      ?.formatter
    expect(yFormatter).toBeDefined()
    expect(yFormatter(null, { dataPointIndex: 1 })).toEqual(
      '2000.014 metric tons',
    )
  })

  it.skip('should format data label values with proper data instead of scaled down data', () => {
    act(() => {
      const handlePage: (page: Page<Entry>) => void = fixture.root.findByType(
        Pagination,
      ).props?.handlePage
      // make pagination send first page
      handlePage({
        data: [
          { x: 'ebs', y: 100 },
          { x: 'ec2', y: 67.00015384528277 },
          { x: 's3', y: 34.00030769056555 },
          { x: 'eks', y: 1 },
        ],
        page: 0,
      })
    })

    const dataLabelFormatter = fixture.root.findByType(Chart).props?.options
      ?.dataLabels?.formatter
    expect(dataLabelFormatter).toBeDefined()
    expect(dataLabelFormatter(null, { dataPointIndex: 1 })).toEqual('33.33 %')
  })

  it.skip('should format data label values that are less than 0.01', () => {
    act(() => {
      const handlePage: (page: Page<Entry>) => void = fixture.root.findByType(
        Pagination,
      ).props?.handlePage
      // make pagination send first page
      handlePage({
        data: [
          { x: 'ebs', y: 100 },
          { x: 'ec2', y: 67.00015384528277 },
          { x: 's3', y: 34.00030769056555 },
          { x: 'eks', y: 1 },
        ],
        page: 0,
      })
    })

    const dataLabelFormatter = fixture.root.findByType(Chart).props?.options
      ?.dataLabels?.formatter
    expect(dataLabelFormatter).toBeDefined()
    expect(dataLabelFormatter(null, { dataPointIndex: 3 })).toEqual('< 0.01 %')
  })

  it('should filter, sort, order, and scale down data before passing it to Pagination component', function () {
    const paginationComponent = fixture.root.findByType(Pagination)
    const sortedData = [
      { x: 'ebs', y: 100 },
      { x: 'ec2', y: 67.00015384528277 },
      { x: 's3', y: 34.00030769056555 },
      { x: 'eks', y: 1 },
    ]

    expect(paginationComponent.props.data).toEqual(sortedData)
  })
})
