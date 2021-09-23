/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { useRemoteService } from 'utils/hooks'
import { generateEstimations } from 'utils/data'
import { ServiceResult } from 'Types'
import Forecast from './Forecast'

jest.mock('utils/hooks/RemoteServiceHook')

const mockUseRemoteService = useRemoteService as jest.MockedFunction<
  typeof useRemoteService
>

describe('Forecast', () => {
  let data: EstimationResult[]

  beforeEach(() => {
    data = generateEstimations(moment.utc(), 12)
    const mockReturnValue: ServiceResult<EstimationResult> = {
      loading: false,
      data: data,
    }
    mockUseRemoteService.mockReturnValue(mockReturnValue)
  })

  afterEach(() => {
    mockUseRemoteService.mockClear()
  })

  it('should render the title', () => {
    const { getByText } = render(<Forecast />)

    expect(getByText('Forecast')).toBeInTheDocument()
  })

  it('should render the current forecast card', () => {
    const { getByText } = render(<Forecast />)

    expect(getByText('Current')).toBeInTheDocument()
  })

  it('should passed in to remote service hook today and january first of the last year', () => {
    render(<Forecast />)

    const parameters = mockUseRemoteService.mock.calls[0]

    expect(parameters.length).toEqual(3)

    const initial = parameters[0]
    const startDate = parameters[1]
    const endDate = parameters[2]

    expect(initial).toEqual([])
    expect(startDate.year()).toEqual(endDate.year() - 1)

    expect(endDate.isSame(moment.utc(), 'day')).toBeTruthy()
  })

  it('should show loading icon if data has not been returned', () => {
    const mockLoading: ServiceResult<EstimationResult> = {
      loading: true,
      data: data,
    }
    mockUseRemoteService.mockReturnValue(mockLoading)

    const { getByRole } = render(<Forecast />)

    expect(getByRole('progressbar')).toBeInTheDocument()
  })
})
