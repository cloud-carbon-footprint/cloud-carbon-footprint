/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React from 'react'
import { create, ReactTestRenderer } from 'react-test-renderer'
import moment from 'moment'

import { ApexDonutChart } from './ApexDonutChart'
import { EstimationResult } from '../../models/types'
import Chart from 'react-apexcharts'
jest.mock('../../themes')

describe('ApexDonutChart', () => {
  let fixture: ReactTestRenderer

  beforeEach(() => {
    const data: EstimationResult[] = [
      {
        timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
        serviceEstimates: [
          {
            cloudProvider: 'AWS',
            accountName: 'some account',
            serviceName: 'ebs',
            wattHours: 0,
            co2e: 3015.014,
            cost: 0,
            region: 'us-west-2',
          },
          {
            cloudProvider: 'AWS',
            accountName: 'some account',
            serviceName: 's3',
            wattHours: 0,
            co2e: 1718.017,
            cost: 0,
            region: 'us-west-2',
          },
          {
            cloudProvider: 'AWS',
            accountName: 'some account',
            serviceName: 'ec2',
            wattHours: 0,
            co2e: 2521.406,
            cost: 0,
            region: 'us-west-2',
          },
        ],
      },
    ]
    fixture = create(<ApexDonutChart data={data} dataType="service" />)
  })
  it('renders with correct configuration', () => {
    expect(fixture.toJSON()).toMatchSnapshot()
  })

  it('should pass sorted chart options to Chart component', function () {
    const chartOptionLabels = fixture.root.findByType(Chart).props?.options?.labels
    const chartOptionSeries = fixture.root.findByType(Chart).props?.options?.series

    expect(chartOptionLabels).toEqual(['ebs', 'ec2', 's3'])
    expect(chartOptionSeries).toEqual([3015.014, 2521.406, 1718.017])
  })
})
