import React, { Dispatch, SetStateAction } from 'react'
import ServiceFilter from './ServiceFilter'
import { Filters } from './hooks/Filters'
import { fireEvent, render, RenderResult } from '@testing-library/react'

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
    fireEvent.click(page.getByLabelText('Open'))

    await assertCheckbox(page, 'All Services', true)
    await assertCheckbox(page, 'EBS', true)
    await assertCheckbox(page, 'S3', true)
    await assertCheckbox(page, 'EC2', true)
    await assertCheckbox(page, 'ElastiCache', true)
    await assertCheckbox(page, 'RDS', true)
    await assertCheckbox(page, 'Lambda', true)
  })

  it('updates the filters when All Services is unselected', async () => {
    fireEvent.click(page.getByLabelText('Open'))
    await assertCheckbox(page, 'All Services', true)

    fireEvent.click(page.getByRole('checkbox-all'))

    const newFilters = filters.withServices([])
    expect(mockSetFilters).toHaveBeenCalledWith(newFilters)

    page.rerender(<ServiceFilter filters={newFilters} setFilters={mockSetFilters} />)

    await assertCheckbox(page, 'All Services', false)
    await assertCheckbox(page, 'EBS', false)
    await assertCheckbox(page, 'S3', false)
    await assertCheckbox(page, 'EC2', false)
    await assertCheckbox(page, 'ElastiCache', false)
    await assertCheckbox(page, 'RDS', false)
    await assertCheckbox(page, 'Lambda', false)
  })

  it('updates the filters when an option is unselected', async () => {
    fireEvent.click(page.getByLabelText('Open'))

    fireEvent.click(page.getByRole('checkbox-ebs'))

    const newFilters = filters.withServices(['s3', 'ec2', 'elasticache', 'rds', 'lambda'])
    expect(mockSetFilters).toHaveBeenCalledWith(newFilters)

    page.rerender(<ServiceFilter filters={newFilters} setFilters={mockSetFilters} />)

    await assertCheckbox(page, 'All Services', false)
    await assertCheckbox(page, 'EBS', false)
    await assertCheckbox(page, 'S3', true)
    await assertCheckbox(page, 'EC2', true)
    await assertCheckbox(page, 'ElastiCache', true)
    await assertCheckbox(page, 'RDS', true)
    await assertCheckbox(page, 'Lambda', true)
  })

  const assertCheckbox = async (page: RenderResult, option: string, selected: boolean) => {
    const li = await page.findByText(option)

    if (selected) {
      expect(li.firstChild).toHaveClass('Mui-checked')
    } else {
      expect(li.firstChild).not.toHaveClass('Mui-checked')
    }
  }
})
