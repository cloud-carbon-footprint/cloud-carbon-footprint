/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { useRemoteService } from 'utils/hooks'
import { generateEstimations, mockRecommendationData } from 'utils/data'
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

  it('should render the title', async () => {
    const { findByText } = render(
      <Forecast recommendations={mockRecommendationData} />,
    )
    const forecast = await findByText('Forecast')

    expect(forecast).toBeInTheDocument()
  })

  it('should render the current forecast card', async () => {
    const { findByText } = render(
      <Forecast recommendations={mockRecommendationData} />,
    )
    const current = await findByText('Current')

    expect(current).toBeInTheDocument()
  })

  it('should passed in to remote service hook today and january first of the last year', () => {
    render(<Forecast recommendations={mockRecommendationData} />)

    const parameters = mockUseRemoteService.mock.calls[0]

    expect(parameters.length).toEqual(3)

    const initial = parameters[0]
    const startDate = parameters[1]
    const endDate = parameters[2]

    expect(initial).toEqual([])
    expect(startDate.year()).toEqual(endDate.year() - 1)

    expect(endDate.isSame(moment.utc(), 'day')).toBeTruthy()
  })
})
