/*
 * © 2021 ThoughtWorks, Inc.
 */

import React from 'react'
import {
  create,
  ReactTestInstance,
  ReactTestRenderer,
} from 'react-test-renderer'
import { act, fireEvent, render, RenderResult } from '@testing-library/react'
import { Select } from '@material-ui/core'

import {
  EstimationResult,
  EmissionRatioResult,
} from '@cloud-carbon-footprint/common'

import { EmissionsBreakdownContainer } from './EmissionsBreakdownContainer'
import { ApexBarChart } from './ApexBarChart'
import { ServiceResult } from '../../models/types'
import useRemoteEmissionService from '../client/EmissionFactorServiceHook'
import { fakeEmissionFactors } from '../../data/generateEstimations'

jest.mock('../../themes')
jest.mock('../client/EmissionFactorServiceHook')

const mockedUseEmissionFactorService =
  useRemoteEmissionService as jest.MockedFunction<
    typeof useRemoteEmissionService
  >

describe('EmissionsBreakdownContainer', () => {
  const date1 = new Date('2020-07-10T00:00:00.000Z')
  const date2 = new Date('2020-07-11T00:00:00.000Z')
  let page: RenderResult
  let testRenderer: ReactTestRenderer, testInstance: ReactTestInstance

  const dataWithHigherPrecision: EstimationResult[] = [
    {
      timestamp: date1,
      serviceEstimates: [
        {
          cloudProvider: 'aws',
          accountName: 'testacct',
          serviceName: 'ebs',
          kilowattHours: 12.2342,
          co2e: 15.12341,
          cost: 5.82572,
          region: 'us-east-1',
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountName: 'testacct',
          serviceName: 'ec2',
          kilowattHours: 4.745634,
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
          kilowattHours: 25.73446,
          co2e: 3.2600234,
          cost: 6.05931,
          region: 'us-east-1',
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountName: 'testacct',
          serviceName: 'ec2',
          kilowattHours: 2.4523452,
          co2e: 7.7536,
          cost: 6.2323,
          region: 'us-east-1',
          usesAverageCPUConstant: true,
        },
      ],
    },
  ]

  beforeEach(() => {
    const mockReturnValue: ServiceResult<EmissionRatioResult> = {
      loading: false,
      data: fakeEmissionFactors,
    }
    mockedUseEmissionFactorService.mockReturnValue(mockReturnValue)
    testRenderer = create(
      <EmissionsBreakdownContainer data={dataWithHigherPrecision} />,
    )
    testInstance = testRenderer.root
    page = render(
      <EmissionsBreakdownContainer data={dataWithHigherPrecision} />,
    )
  })

  afterEach(() => {
    testRenderer.unmount()
    page.unmount()
    mockedUseEmissionFactorService.mockClear()
  })

  it('renders bar chart with dropdown', () => {
    //emulate click to test
    const allMenuItemInstancesList = testInstance.findAllByType(Select)

    expect(allMenuItemInstancesList).toHaveLength(1)

    expect(testRenderer.toJSON()).toMatchSnapshot()
  })

  it('checks to see if bar chart exists upon loading', () => {
    const isApexBarChartRendered = testInstance.findAllByType(ApexBarChart)

    expect(isApexBarChartRendered).toHaveLength(1)
  })

  it('renders emission by region bar chart by default', () => {
    const isApexBarChartRendered = testInstance.findByType(ApexBarChart)

    expect(isApexBarChartRendered.props.dataType).toBe('region')
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
