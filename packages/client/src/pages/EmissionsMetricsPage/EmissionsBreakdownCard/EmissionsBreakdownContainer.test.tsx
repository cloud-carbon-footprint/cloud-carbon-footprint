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
import { EmissionRatioResult } from '@cloud-carbon-footprint/common'
import { ServiceResult } from 'Types'
import { useRemoteEmissionService } from 'utils/hooks'
import { fakeEmissionFactors, mockDataWithHigherPrecision } from 'utils/data'
import EmissionsBreakdownContainer from './EmissionsBreakdownContainer'
import { ApexBarChart } from './ApexBarChart'

jest.mock('apexcharts')
jest.mock('utils/themes')
jest.mock('utils/hooks/EmissionFactorServiceHook')

const mockedUseEmissionFactorService =
  useRemoteEmissionService as jest.MockedFunction<
    typeof useRemoteEmissionService
  >

describe('EmissionsBreakdownContainer', () => {
  let page: RenderResult
  let testRenderer: ReactTestRenderer, testInstance: ReactTestInstance
  const styleClass = 'test-style-class'

  beforeEach(() => {
    const mockReturnValue: ServiceResult<EmissionRatioResult> = {
      loading: false,
      data: fakeEmissionFactors,
    }
    mockedUseEmissionFactorService.mockReturnValue(mockReturnValue)
    testRenderer = create(
      <EmissionsBreakdownContainer
        containerClass={styleClass}
        data={mockDataWithHigherPrecision}
      />,
    )
    testInstance = testRenderer.root
    page = render(
      <EmissionsBreakdownContainer
        containerClass={styleClass}
        data={mockDataWithHigherPrecision}
      />,
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
