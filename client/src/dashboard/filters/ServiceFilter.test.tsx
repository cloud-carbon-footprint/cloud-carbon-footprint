/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { Dispatch, SetStateAction } from 'react'
import ServiceFilter from './ServiceFilter'
import { Filters } from './Filters'
import { fireEvent, render, RenderResult, act } from '@testing-library/react'

describe('ServiceFilter', () => {
  let mockSetFilters: jest.Mocked<Dispatch<SetStateAction<Filters>>>
  let page: RenderResult
  let filters: Filters

  beforeEach(() => {
    mockSetFilters = jest.fn()
    filters = new Filters()
    page = render(<ServiceFilter filters={filters} setFilters={mockSetFilters} />)
  })

  it('has all services selected by default', async () => {
    expect(page.getByText('Services: 6 of 6')).toBeInTheDocument()
  })

  it('displays the options when opened', async () => {
    act(() => {
      fireEvent.click(page.getByLabelText('Open'))
    })

    assertCheckbox(page, 'All Services', true)
    assertCheckbox(page, 'EBS', true)
    assertCheckbox(page, 'S3', true)
    assertCheckbox(page, 'EC2', true)
    assertCheckbox(page, 'ElastiCache', true)
    assertCheckbox(page, 'RDS', true)
    assertCheckbox(page, 'Lambda', true)
  })

  it('updates the filters when All Services is unselected', async () => {
    act(() => {
      fireEvent.click(page.getByLabelText('Open'))
    })
    act(() => {
      fireEvent.click(page.getByRole('checkbox-all'))
    })

    const newFilters = filters.withServices([])
    expect(mockSetFilters).toHaveBeenCalledWith(newFilters)

    page.rerender(<ServiceFilter filters={newFilters} setFilters={mockSetFilters} />)

    expect(page.getByText('Services: 0 of 6')).toBeInTheDocument()
    assertCheckbox(page, 'All Services', false)
    assertCheckbox(page, 'EBS', false)
    assertCheckbox(page, 'S3', false)
    assertCheckbox(page, 'EC2', false)
    assertCheckbox(page, 'ElastiCache', false)
    assertCheckbox(page, 'RDS', false)
    assertCheckbox(page, 'Lambda', false)
  })

  it('updates the filters when an option is unselected', async () => {
    act(() => {
      fireEvent.click(page.getByLabelText('Open'))
    })
    act(() => {
      fireEvent.click(page.getByRole('checkbox-ebs'))
    })

    const newFilters = filters.withServices(['all', 's3', 'ec2', 'elasticache', 'rds', 'lambda'])
    expect(mockSetFilters).toHaveBeenCalledWith(newFilters)

    page.rerender(<ServiceFilter filters={newFilters} setFilters={mockSetFilters} />)

    expect(page.getByText('Services: 5 of 6')).toBeInTheDocument()
    assertCheckbox(page, 'All Services', false)
    assertCheckbox(page, 'EBS', false)
    assertCheckbox(page, 'S3', true)
    assertCheckbox(page, 'EC2', true)
    assertCheckbox(page, 'ElastiCache', true)
    assertCheckbox(page, 'RDS', true)
    assertCheckbox(page, 'Lambda', true)
  })

  const assertCheckbox = (page: RenderResult, option: string, selected: boolean) => {
    const li = page.getByText(option)

    if (selected) {
      expect(li.firstChild).toHaveClass('Mui-checked')
    } else {
      expect(li.firstChild).not.toHaveClass('Mui-checked')
    }
  }
})
