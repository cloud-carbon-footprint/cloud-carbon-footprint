/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { Dispatch, SetStateAction } from 'react'
import { render, RenderResult, act, fireEvent } from '@testing-library/react'
import moment from 'moment'
import MockDate from 'mockdate'
import DateFilter from './DateFilter'
import { FiltersDateRange, Filters } from 'common/FilterBar/utils/Filters'
import { EmissionsFilters } from '../../utils/EmissionsFilters'

describe('DatePicker', () => {
  let mockSetFilters: jest.Mock<Dispatch<SetStateAction<Filters>>>
  let page: RenderResult
  let filters: Filters

  beforeEach(() => {
    MockDate.set('2020-09-16T00:00:00Z')
    mockSetFilters = jest.fn()
    filters = new EmissionsFilters()
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

  it('opens the calendar when focused', () => {
    act(() => {
      fireEvent.focus(page.getByPlaceholderText('Start Date'))
    })

    const nov = page.queryByText('November 2020')
    expect(nov).not.toBeInTheDocument()

    const oct = page.queryByText('October 2020')
    expect(oct).toBeInTheDocument()
    expect(oct?.closest('div[data-visible="false"]')).toBeInTheDocument()

    const sept = page.queryByText('September 2020')
    expect(sept).toBeInTheDocument()
    expect(sept?.closest('div[data-visible="true"]')).toBeInTheDocument()

    const aug = page.queryByText('August 2020')
    expect(aug).toBeInTheDocument()
    expect(aug?.closest('div[data-visible="true"]')).toBeInTheDocument()

    const july = page.queryByText('July 2020')
    expect(july).toBeInTheDocument()
    expect(july?.closest('div[data-visible="false"]')).toBeInTheDocument()

    const june = page.queryByText('June 2020')
    expect(june).not.toBeInTheDocument()
  })

  it('selects start date', () => {
    act(() => {
      fireEvent.focus(page.getByPlaceholderText('Start Date'))
    })

    const firstOfMonth = page.getAllByText('1')
    expect(firstOfMonth.length).toEqual(4)
    const firstOfAugust = firstOfMonth[1]

    act(() => {
      fireEvent.click(firstOfAugust)
    })

    const updatedFilters: Filters = mockSetFilters.mock.calls[0][0]
    expect(
      updatedFilters.dateRange?.startDate?.isSame(
        moment('2020-08-01T12:00:00Z'),
      ),
    ).toEqual(true)
    expect(updatedFilters.dateRange?.endDate).toBeNull()

    act(() => {
      page.rerender(
        <DateFilter filters={updatedFilters} setFilters={mockSetFilters} />,
      )
    })

    page.getByDisplayValue('08/01/2020')
  })

  it('selects end date', () => {
    act(() => {
      fireEvent.focus(page.getByPlaceholderText('End Date'))
    })

    const firstOfMonth = page.getAllByText('1')
    expect(firstOfMonth.length).toEqual(4)
    const firstOfSeptember = firstOfMonth[2]

    act(() => {
      fireEvent.click(firstOfSeptember)
    })

    const updatedFilters: Filters = mockSetFilters.mock.calls[0][0]
    expect(updatedFilters.dateRange?.startDate).toBeNull()
    expect(
      updatedFilters.dateRange?.endDate?.isSame(moment('2020-09-01T12:00:00Z')),
    ).toEqual(true)

    act(() => {
      page.rerender(
        <DateFilter filters={updatedFilters} setFilters={mockSetFilters} />,
      )
    })

    page.getByDisplayValue('09/01/2020')
  })

  it('shows the selected start date when opening the dropdown via start date', () => {
    act(() => {
      const newFilters = filters.withDateRange(
        new FiltersDateRange(
          moment('2020-03-01T12:00:00Z'),
          moment('2020-09-01T12:00:00Z'),
        ),
      )
      page.rerender(
        <DateFilter filters={newFilters} setFilters={mockSetFilters} />,
      )
    })

    page.getByDisplayValue('03/01/2020')
    page.getByDisplayValue('09/01/2020')

    act(() => {
      fireEvent.focus(page.getByPlaceholderText('Start Date'))
    })

    const mar = page.queryByText('March 2020')
    expect(mar).toBeInTheDocument()
    expect(mar?.closest('div[data-visible="true"]')).toBeInTheDocument()

    const sept = page.queryByText('September 2020')
    expect(sept).not.toBeInTheDocument()
  })

  it('shows the selected end date when opening the dropdown via end date', () => {
    act(() => {
      const newFilters = filters.withDateRange(
        new FiltersDateRange(
          moment('2020-03-01T12:00:00Z'),
          moment('2020-07-01T12:00:00Z'),
        ),
      )
      page.rerender(
        <DateFilter filters={newFilters} setFilters={mockSetFilters} />,
      )
    })

    page.getByDisplayValue('03/01/2020')
    page.getByDisplayValue('07/01/2020')

    act(() => {
      fireEvent.focus(page.getByPlaceholderText('End Date'))
    })

    const mar = page.queryByText('March 2020')
    expect(mar).not.toBeInTheDocument()

    const july = page.queryByText('July 2020')
    expect(july).toBeInTheDocument()
    expect(july?.closest('div[data-visible="true"]')).toBeInTheDocument()
  })
})
