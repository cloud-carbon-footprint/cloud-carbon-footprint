/*
 * © 2021 Thoughtworks, Inc.
 */

import { render } from '@testing-library/react'
import DateRange from './DateRange'

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2021-01-13T00:00:00.000Z')
})

describe('Date Range', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render', () => {
    const { getByTestId } = render(<DateRange lookBackPeriodDays={13} />)
    expect(getByTestId('dateRange')).toBeInTheDocument()
  })

  it('should show date 2 weeks from today', () => {
    const { getByTestId } = render(<DateRange lookBackPeriodDays={13} />)

    expect(getByTestId('dateRange').textContent).toEqual(
      'Dec 31, 2020 - Jan 13, 2021',
    )
  })
})
