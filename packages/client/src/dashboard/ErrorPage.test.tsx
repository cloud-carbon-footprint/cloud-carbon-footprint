/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { render } from '@testing-library/react'
import React from 'react'
import ErrorPage from './ErrorPage'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
  }),
  useLocation: () => ({
    state: {
      statusText: 'internal error',
      status: 500,
    },
  }),
}))

describe('ErrorPage', () => {
  test('renders when there is an error', () => {
    const { getByTestId } = render(<ErrorPage />)
    expect(getByTestId('error-page')).toBeInTheDocument()
  })
})
