import React from 'react'
import { render } from '@testing-library/react'
import App from './App'
import generateEstimations from './data/generateEstimations'
import moment from 'moment'
import useRemoteService from './hooks/RemoteServiceHook'
import { ServiceResult } from './types'

jest.mock('react-apexcharts', () =>
  jest.fn(() => {
    return null
  }),
)
jest.mock('./hooks/RemoteServiceHook')

const mockedUseRemoteService = useRemoteService as jest.MockedFunction<typeof useRemoteService>

describe('App', () => {
  beforeEach(() => {
    const mockReturnValue: ServiceResult = { loading: false, error: false, data: generateEstimations(moment.utc(), 14) }
    mockedUseRemoteService.mockReturnValue(mockReturnValue)
  })

  test('renders the page title', () => {
    const { getByText } = render(<App />)
    const linkElement = getByText(/AWS Emissions and Wattage and Cost/i)
    expect(linkElement).toBeInTheDocument()
  })
})
