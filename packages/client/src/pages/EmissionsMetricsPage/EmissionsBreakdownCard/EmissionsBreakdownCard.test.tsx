/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import {
  act,
  create,
  ReactTestInstance,
  ReactTestRenderer,
} from 'react-test-renderer'
import { EmissionRatioResult } from '@cloud-carbon-footprint/common'
import { ServiceResult } from 'Types'
import SelectDropdown from 'common/SelectDropdown'
import NoDataMessage from 'common/NoDataMessage'
import { useRemoteEmissionService } from 'utils/hooks'
import { fakeEmissionFactors, mockDataWithHigherPrecision } from 'utils/data'
import EmissionsBreakdownCard from './EmissionsBreakdownCard'
import ApexBarChart from './ApexBarChart'

jest.mock('apexcharts')
jest.mock('utils/themes')
jest.mock('utils/hooks/EmissionFactorServiceHook')

const mockedUseEmissionFactorService =
  useRemoteEmissionService as jest.MockedFunction<
    typeof useRemoteEmissionService
  >

describe('EmissionsBreakdownCard', () => {
  let testRenderer: ReactTestRenderer, testInstance: ReactTestInstance
  const styleClass = 'test-style-class'

  beforeEach(() => {
    const mockReturnValue: ServiceResult<EmissionRatioResult> = {
      loading: false,
      data: fakeEmissionFactors,
    }
    mockedUseEmissionFactorService.mockReturnValue(mockReturnValue)
    testRenderer = create(
      <EmissionsBreakdownCard
        containerClass={styleClass}
        data={mockDataWithHigherPrecision}
      />,
    )
    testInstance = testRenderer.root
  })

  afterEach(() => {
    testRenderer.unmount()
    mockedUseEmissionFactorService.mockClear()
  })

  it('renders a select dropdown for the bar chart', () => {
    const selectDropdownInstances = testInstance.findAllByType(SelectDropdown)

    expect(selectDropdownInstances).toHaveLength(1)
    expect(testRenderer.toJSON()).toMatchSnapshot()
  })

  it('renders the apex bar chart to display data', () => {
    const isApexBarChartRendered = testInstance.findAllByType(ApexBarChart)

    expect(isApexBarChartRendered).toHaveLength(1)
  })

  it('renders emission breakdowns by region on the bar chart by default', () => {
    const isApexBarChartRendered = testInstance.findByType(ApexBarChart)

    expect(isApexBarChartRendered.props.dataType).toBe('region')
  })

  it('updates the chart type when a different one is selected from the dropdown', () => {
    act(() =>
      testInstance
        .findByType(SelectDropdown)
        .props.handleChange({ target: { value: 'Service' } }),
    )

    expect(testInstance.findByType(ApexBarChart).props.dataType).toBe('Service')
  })

  it('should show a no data message when there is no data to display', () => {
    testRenderer.unmount()
    const fixture = create(<EmissionsBreakdownCard data={[]} />)
    const noDataComponent = fixture.root.findByType(NoDataMessage)

    expect(noDataComponent).toBeDefined()
    expect(noDataComponent.props.title).toBe('Emissions Breakdown')
  })
})
