/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import moment from 'moment'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render } from '@testing-library/react'
import { generateEstimations, fakeEmissionFactors } from './utils/data'
import {
  useRemoteFootprintService,
  useRemoteEmissionService,
  useRemoteRecommendationsService,
} from './utils/hooks'
import {
  EstimationResult,
  EmissionRatioResult,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import { ServiceResult } from './Types'
import loadConfig from './ConfigLoader'
import { App } from './App'

jest.mock('apexcharts')
jest.mock('./utils/hooks/FootprintServiceHook')
jest.mock('./utils/hooks/EmissionFactorServiceHook')
jest.mock('./utils/hooks/RecommendationsServiceHook')
jest.mock('./utils/themes')
jest.mock('./ConfigLoader', () => ({
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

const mockedUseRemoteService = useRemoteFootprintService as jest.MockedFunction<
  typeof useRemoteFootprintService
>
const mockedUseEmissionFactorService =
  useRemoteEmissionService as jest.MockedFunction<
    typeof useRemoteEmissionService
  >
const mockedUseRecommendationsService =
  useRemoteRecommendationsService as jest.MockedFunction<
    typeof useRemoteRecommendationsService
  >

describe('App', () => {
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

    const mockReturnValue: ServiceResult<EstimationResult> = {
      loading: false,
      data: generateEstimations(moment.utc(), 14),
      error: null,
    }
    const mockEmissionsReturnValue: ServiceResult<EmissionRatioResult> = {
      loading: false,
      data: fakeEmissionFactors,
      error: null,
    }
    const mockRecommendationsReturnValue: ServiceResult<RecommendationResult> =
      {
        loading: false,
        data: [],
        error: null,
      }
    mockedUseEmissionFactorService.mockReturnValue(mockEmissionsReturnValue)
    mockedUseRemoteService.mockReturnValue(mockReturnValue)
    mockedUseRecommendationsService.mockReturnValue(
      mockRecommendationsReturnValue,
    )
  })

  afterEach(() => {
    mockedUseEmissionFactorService.mockClear()
    mockedUseRemoteService.mockClear()
    mockedUseRecommendationsService.mockClear()
  })

  it('renders the page title', () => {
    const { getAllByText } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const linkElement = getAllByText(/Cloud Carbon Footprint/i)[0]
    expect(linkElement).toBeInTheDocument()
  })

  it('renders the mobile compatability warning if the window is too small and loads the page when closed', () => {
    global.innerWidth = 700 // Set page width below threshold
    const { getByTestId, queryByTestId, getByRole } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(getByTestId('warning-modal')).toBeInTheDocument()

    const closeButton = getByRole('button')
    fireEvent.click(closeButton)

    expect(getByTestId('infoIcon')).toBeInTheDocument()
    expect(queryByTestId('warning-modal')).toBeFalsy()

    global.innerWidth = 1024 // Reset page width back to default size
  })

  it('should passed in to remote service hook today and january first of the last year', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const parameters = mockedUseRemoteService.mock.calls[0][0]

    expect(parameters.startDate.year()).toEqual(parameters.endDate.year() - 1)
    expect(parameters.startDate.month()).toEqual(0)
    expect(parameters.startDate.date()).toEqual(1)
    expect(parameters.endDate.isSame(moment.utc(), 'day')).toBeTruthy()
    expect(parameters.baseUrl).toEqual('/api')
  })

  it('should pass custom dates (when provided) into the service hook', () => {
    ;(loadConfig as jest.Mock).mockImplementation(() => ({
      CURRENT_PROVIDERS: [
        { key: 'aws', name: 'AWS' },
        { key: 'gcp', name: 'GCP' },
      ],
      PREVIOUS_YEAR_OF_USAGE: false,
      DATE_RANGE: {
        VALUE: '7',
        TYPE: 'days',
      },
      BASE_URL: '/api',
      START_DATE: '2020-01-01',
      END_DATE: '2020-01-31',
    }))

    const expectedStartDate = moment.utc('2020-01-01').toDate()
    const expectedEndDate = moment.utc('2020-01-31').toDate()

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    const parameters = mockedUseRemoteService.mock.calls[0][0]

    expect(parameters.startDate.toDate()).toEqual(expectedStartDate)
    expect(parameters.endDate.toDate()).toEqual(expectedEndDate)
    expect(parameters.baseUrl).toEqual('/api')
  })

  describe('page routing', () => {
    it('navigates to the home page', () => {
      const { getByTestId } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )

      expect(getByTestId('infoIcon')).toBeInTheDocument()
    })

    it('navigates to the Recommendations Page', () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/recommendations']}>
          <App />
        </MemoryRouter>,
      )

      expect(getByText('Recommendations')).toBeInTheDocument()
    })
  })
})
