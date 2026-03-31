/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { Dispatch, SetStateAction } from 'react'
import {
  render,
  RenderResult,
  act,
  fireEvent,
  waitFor,
} from '@testing-library/react'
import moment from 'moment'
import MockDate from 'mockdate'
import DateFilter from './DateFilter'
import {
  FiltersDateRange,
  Filters,
} from '../../../../../common/FilterBar/utils/Filters'
import { EmissionsFilters } from '../../utils/EmissionsFilters'

describe('DatePicker', () => {
  let mockSetFilters: jest.Mock<Dispatch<SetStateAction<Filters>>>
  let page: RenderResult

  beforeEach(() => {
    MockDate.set('2020-09-16T00:00:00Z')
    mockSetFilters = jest.fn()
    const filters = new EmissionsFilters()
    page = render(<DateFilter filters={filters} setFilters={mockSetFilters} />)
  })

  afterEach(() => {
    page.unmount()
    MockDate.reset()
  })

  it('has nothing selected by default', () => {
    expect(page.queryByPlaceholderText('Start Date')).toBeInTheDocument()
    expect(page.queryByPlaceholderText('End Date')).toBeInTheDocument()
  })

  it('opens the calendar when the start date Choose date button is clicked', async () => {
    const chooseButtons = page.getAllByRole('button', { name: 'Choose date' })
    await act(async () => {
      fireEvent.click(chooseButtons[0])
    })
    await waitFor(() => {
      expect(page.getByRole('dialog')).toBeInTheDocument()
    })
    expect(page.getByText('September 2020')).toBeInTheDocument()
  })

  it('shows selected range in the inputs when both dates are set', () => {
    const newFilters = new EmissionsFilters().withDateRange(
      new FiltersDateRange(
        moment('2020-03-01T12:00:00.000Z'),
        moment('2020-09-01T12:00:00.000Z'),
      ),
    )
    page.rerender(
      <DateFilter filters={newFilters} setFilters={mockSetFilters} />,
    )

    expect(page.getByPlaceholderText('Start Date')).toHaveValue('03/01/2020')
    expect(page.getByPlaceholderText('End Date')).toHaveValue('09/01/2020')
  })
})
