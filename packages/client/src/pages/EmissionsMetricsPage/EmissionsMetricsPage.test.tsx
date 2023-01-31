/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'

import {
  EmissionRatioResult,
  EstimationResult,
} from '@cloud-carbon-footprint/common'
import { useRemoteEmissionService } from '../../utils/hooks'
import { fakeEmissionFactors, generateEstimations } from '../../utils/data'
import { ServiceResult } from '../../Types'
import EmissionsMetricsPage from './EmissionsMetricsPage'
import loadConfig from '../../ConfigLoader'
import { FootprintData } from '../../utils/hooks/FootprintDataHook'

jest.mock('apexcharts')
jest.mock('../../utils/hooks/FootprintServiceHook')
jest.mock('../../utils/hooks/EmissionFactorServiceHook')
jest.mock('../../utils/themes')
jest.mock('../../ConfigLoader', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    CURRENT_PROVIDERS: [
      { key: 'aws', name: 'AWS' },
      { key: 'gcp', name: 'GCP' },
    ],
    PREVIOUS_YEAR_OF_USAGE: true,
    DATE_RANGE: {
      VALUE: '7',
      TYPE: 'days',
    },
    BASE_URL: '/api',
  })),
}))

const mockedUseEmissionFactorService =
  useRemoteEmissionService as jest.MockedFunction<
    typeof useRemoteEmissionService
  >

describe('Emissions Metrics Page', () => {
  const data: EstimationResult[] = generateEstimations(moment.utc(), 14)
  const mockFootprintData: FootprintData = {
    loading: false,
    data: data,
    error: null,
  }

  beforeEach(() => {
    ;(loadConfig as jest.Mock).mockImplementation(() => ({
      CURRENT_PROVIDERS: [
        { key: 'aws', name: 'AWS' },
        { key: 'gcp', name: 'GCP' },
      ],
      PREVIOUS_YEAR_OF_USAGE: true,
      DATE_RANGE: {
        VALUE: '7',
        TYPE: 'days',
      },
      BASE_URL: '/api',
    }))

    const mockEmissionsReturnValue: ServiceResult<EmissionRatioResult> = {
      loading: false,
      data: fakeEmissionFactors,
      error: null,
    }
    mockedUseEmissionFactorService.mockReturnValue(mockEmissionsReturnValue)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render all components in the page', () => {
    const { getByText, getByTestId } = render(
      <EmissionsMetricsPage footprint={mockFootprintData} />,
    )

    expect(getByTestId('filterBar')).toBeInTheDocument()
    expect(getByTestId('cloudUsage')).toBeInTheDocument()
    expect(getByText('Emissions Breakdown')).toBeInTheDocument()
    expect(getByTestId('carbonComparison')).toBeInTheDocument()
    expect(getByText('Carbon Intensity Map')).toBeInTheDocument()
  })
})
