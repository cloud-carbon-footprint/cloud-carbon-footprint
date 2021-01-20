/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { create, ReactTestRenderer } from 'react-test-renderer'
import { EstimationResult } from '../../models/types'
import moment from 'moment'
import React from 'react'
import { ApexBarChart } from './ApexBarChart'
import Chart from 'react-apexcharts'

describe('ApexBarChart', () => {
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
    fixture = create(<ApexBarChart data={data} dataType="service" />)
  })
  it('renders with correct configuration', () => {
    expect(fixture.toJSON()).toMatchSnapshot()
  })

  it('should set the tooltip value formatter correctly', () => {
    const yFormatter = fixture.root.findByType(Chart).props?.options?.tooltip?.y?.formatter

    expect(yFormatter).toBeDefined()
    expect(yFormatter(1000.23)).toEqual('1000.230 mt')
  })

  it('should pass sorted chart options to Chart component', function () {
    const chartOptionSeries = fixture.root.findByType(Chart).props?.options?.series[0]

    expect(chartOptionSeries.name).toEqual('Total CO2e')
    expect(chartOptionSeries.data).toEqual([
      { x: 'ebs', y: 3015.014 },
      { x: 'ec2', y: 2521.406 },
      { x: 's3', y: 1718.017 },
    ])
  })
})
