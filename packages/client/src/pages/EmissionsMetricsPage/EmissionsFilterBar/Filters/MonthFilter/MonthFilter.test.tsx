/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { Dispatch, SetStateAction } from 'react'
import { fireEvent, render } from '@testing-library/react'
import MonthFilter from './MonthFilter'
import { EmissionsFilters } from '../../utils/EmissionsFilters'
import { Filters } from 'common/FilterBar/utils/Filters'

describe('MonthFilter', () => {
  let filters: Filters
  let mockSetFilters: jest.Mocked<Dispatch<SetStateAction<Filters>>>

  beforeEach(() => {
    filters = new EmissionsFilters()
    mockSetFilters = jest.fn()
  })

  test('initial timeframe should filter up to 12 months prior', () => {
    const page = render(
      <MonthFilter filters={filters} setFilters={mockSetFilters} />,
    )

    expect(mockSetFilters).not.toHaveBeenCalled()

    expect(page.getByText('1M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('3M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('6M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('12M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('All').closest('button')).toHaveClass(
      'MuiButton-containedPrimary',
    )
  })

  test('clicking 1M button should filter up to 1 month prior', () => {
    const page = render(
      <MonthFilter filters={filters} setFilters={mockSetFilters} />,
    )

    fireEvent.click(page.getByText('1M'))

    const newFilters = filters.withTimeFrame(1)
    expect(mockSetFilters).toHaveBeenCalledWith(newFilters)

    page.rerender(
      <MonthFilter filters={newFilters} setFilters={mockSetFilters} />,
    )
    expect(page.getByText('1M').closest('button')).toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('3M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('6M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('12M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
  })

  test('clicking 3M button should filter up to 3 months prior', () => {
    const page = render(
      <MonthFilter filters={filters} setFilters={mockSetFilters} />,
    )

    fireEvent.click(page.getByText('3M'))

    const newFilters = filters.withTimeFrame(3)
    expect(mockSetFilters).toHaveBeenCalledWith(newFilters)

    page.rerender(
      <MonthFilter filters={newFilters} setFilters={mockSetFilters} />,
    )
    expect(page.getByText('1M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('3M').closest('button')).toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('6M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('12M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
  })

  test('clicking 6M button should filter up to 3 months prior', () => {
    const page = render(
      <MonthFilter filters={filters} setFilters={mockSetFilters} />,
    )

    fireEvent.click(page.getByText('6M'))

    const newFilters = filters.withTimeFrame(6)
    expect(mockSetFilters).toHaveBeenCalledWith(newFilters)

    page.rerender(
      <MonthFilter filters={newFilters} setFilters={mockSetFilters} />,
    )
    expect(page.getByText('1M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('3M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('6M').closest('button')).toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('12M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
  })

  test('clicking 12M button should filter up to 12 months prior', () => {
    const page = render(
      <MonthFilter filters={filters} setFilters={mockSetFilters} />,
    )

    fireEvent.click(page.getByText('12M'))

    const newFilters = filters.withTimeFrame(12)
    expect(mockSetFilters).toHaveBeenCalledWith(newFilters)

    page.rerender(
      <MonthFilter filters={newFilters} setFilters={mockSetFilters} />,
    )
    expect(page.getByText('1M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('3M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('6M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('12M').closest('button')).toHaveClass(
      'MuiButton-containedPrimary',
    )
  })

  test('clicking All button should filter up to at least 12 months prior or beyond', () => {
    const page = render(
      <MonthFilter filters={filters} setFilters={mockSetFilters} />,
    )

    fireEvent.click(page.getByText('All'))

    const newFilters = filters.withTimeFrame(36)
    expect(mockSetFilters).toHaveBeenCalledWith(newFilters)

    page.rerender(
      <MonthFilter filters={newFilters} setFilters={mockSetFilters} />,
    )
    expect(page.getByText('1M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('3M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('6M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('12M').closest('button')).not.toHaveClass(
      'MuiButton-containedPrimary',
    )
    expect(page.getByText('All').closest('button')).toHaveClass(
      'MuiButton-containedPrimary',
    )
  })
})
