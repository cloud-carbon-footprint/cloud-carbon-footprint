import React, { Dispatch, SetStateAction } from 'react'
import { Filters } from './hooks/Filters'
import { act, fireEvent, render, RenderResult } from '@testing-library/react'

import DateFilter from './DateFilter'

describe('DatePicker', () => {
  let mockSetFilters: jest.Mocked<Dispatch<SetStateAction<Filters>>>
  let page: RenderResult
  let filters: Filters

  beforeEach(() => {
    mockSetFilters = jest.fn()
    filters = new Filters()
    page = render(<DateFilter filters={filters} setFilters={mockSetFilters} />)
  })

  it('has nothing selected by default', () => {
    expect(page.getByPlaceholderText('Start Date')).toBeInTheDocument()
    expect(page.getByPlaceholderText('End Date')).toBeInTheDocument()
  })
})
