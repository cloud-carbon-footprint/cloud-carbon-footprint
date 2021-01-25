/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React from 'react'
import { create } from 'react-test-renderer'
import moment from 'moment'

import { ApexLineChart } from './ApexLineChart'
import { EstimationResult } from '../../models/types'

jest.mock('../../themes')

describe('ApexLineChart', () => {
  it('renders with correct configuration', () => {
    const data: EstimationResult[] = [
      {
        timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
        serviceEstimates: [
          {
            cloudProvider: 'AWS',
            accountName: 'account-1',
            serviceName: 'ebs',
            wattHours: 0,
            co2e: 5,
            cost: 0,
            region: 'us-west-2',
          },
          {
            cloudProvider: 'AWS',
            accountName: 'account-1',
            serviceName: 's3',
            wattHours: 0,
            co2e: 0,
            cost: 0,
            region: 'us-west-2',
          },
          {
            cloudProvider: 'AWS',
            accountName: 'account-1',
            serviceName: 'ec2',
            wattHours: 0,
            co2e: 2,
            cost: 0,
            region: 'us-west-2',
          },
        ],
      },
    ]
    const root = create(<ApexLineChart data={data} />)

    expect(root.toJSON()).toMatchSnapshot()
  })
})
