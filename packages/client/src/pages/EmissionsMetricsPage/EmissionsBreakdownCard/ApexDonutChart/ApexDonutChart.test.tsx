/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { create, ReactTestRenderer } from 'react-test-renderer'
import moment from 'moment'
import Chart from 'react-apexcharts'

import {
  EstimationResult,
  EmissionRatioResult,
} from '@cloud-carbon-footprint/common'

import { ServiceResult } from '../../../../Types'
import { ApexDonutChart } from './ApexDonutChart'
import { useRemoteEmissionService } from '../../../../utils/hooks'

jest.mock('apexcharts')
jest.mock('utils/themes')
jest.mock('../../../../utils/hooks/EmissionFactorServiceHook')

const mockedUseEmissionFactorService =
  useRemoteEmissionService as jest.MockedFunction<
    typeof useRemoteEmissionService
  >

const emissionsFactorData: EmissionRatioResult[] = [
  {
    region: 'us-west-1',
    mtPerKwHour: 0.000645,
  },
  {
    region: 'us-west-2',
    mtPerKwHour: 0.000635,
  },
  {
    region: 'us-west-3',
    mtPerKwHour: 0.000475,
  },
  {
    region: 'us-west-4',
    mtPerKwHour: 0.000315,
  },
]

describe('ApexDonutChart', () => {
  let fixture: ReactTestRenderer
  const data: EstimationResult[] = [
    {
      timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
      serviceEstimates: [
        {
          cloudProvider: 'AWS',
          accountId: 'some account id',
          accountName: 'some account',
          serviceName: 'ebs',
          kilowattHours: 0,
          co2e: 3000.014,
          cost: 0,
          region: 'us-west-2',
        },
        {
          cloudProvider: 'AWS',
          accountId: 'some account id',
          accountName: 'some account',
          serviceName: 's3',
          kilowattHours: 0,
          co2e: 1000.014,
          cost: 0,
          region: 'us-west-2',
        },
        {
          cloudProvider: 'AWS',
          accountId: 'some account id',
          accountName: 'some account',
          serviceName: 'ec2',
          kilowattHours: 0,
          co2e: 2000.014,
          cost: 0,
          region: 'us-west-2',
        },
        {
          cloudProvider: 'AWS',
          accountId: 'some account id',
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
    const mockReturnValue: ServiceResult<EmissionRatioResult> = {
      loading: false,
      data: emissionsFactorData,
    }
    mockedUseEmissionFactorService.mockReturnValue(mockReturnValue)
    fixture = create(<ApexDonutChart data={data} dataType="service" />)
  })

  afterEach(() => {
    fixture.unmount()
  })

  it('renders with correct configuration', () => {
    expect(fixture.toJSON()).toMatchSnapshot()
  })

  it('should pass sorted chart options to Chart component', () => {
    const chartOptionLabels =
      fixture.root.findByType(Chart).props?.options?.labels
    const chartOptionSeries =
      fixture.root.findByType(Chart).props?.options?.series

    expect(chartOptionLabels).toEqual(['ebs', 'ec2', 's3', 'eks'])
    expect(chartOptionSeries).toEqual([3000.014, 2000.014, 1000.014, 0.000014])
  })

  it('should format tool tip y values to 3 decimal places', () => {
    const yFormatter =
      fixture.root.findByType(Chart).props?.options?.tooltip?.y?.formatter
    expect(yFormatter).toBeDefined()
    expect(yFormatter(2000.0140003)).toEqual('2000.014 metric tons')
  })
})
