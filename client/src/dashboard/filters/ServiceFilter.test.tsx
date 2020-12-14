/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { Dispatch, SetStateAction } from 'react'
import ServiceFilter from './ServiceFilter'
import { Filters } from './Filters'
import { fireEvent, render, RenderResult, act } from '@testing-library/react'

jest.mock('./AccountFilter', () => ({
  ACCOUNT_OPTIONS: [
    { key: 'all', name: 'All Accounts', cloudProvider: '' },
    { key: '321321321', name: 'testaccount0', cloudProvider: 'aws' },
    { key: '123123123', name: 'testaccount1', cloudProvider: 'gcp' },
  ],
}))

jest.mock('../../ConfigLoader', () => {
  return jest.fn().mockImplementation(() => {
    return {
      AWS: {
        CURRENT_SERVICES: [
          { key: 'ebs', name: 'EBS' },
          { key: 's3', name: 'S3' },
          { key: 'ec2', name: 'EC2' },
          { key: 'elasticache', name: 'ElastiCache' },
          { key: 'rds', name: 'RDS' },
          { key: 'lambda', name: 'Lambda' },
        ],
      },
      GCP: {
        CURRENT_SERVICES: [{ key: 'computeEngine', name: 'Compute Engine' }],
      },
      CURRENT_PROVIDERS: [
        { key: 'aws', name: 'AWS' },
        { key: 'gcp', name: 'GCP' },
      ],
    }
  })
})

describe('ServiceFilter', () => {
  let mockSetFilters: jest.Mocked<Dispatch<SetStateAction<Filters>>>
  let page: RenderResult
  let filters: Filters

  const allServiceOption = { key: 'all', name: 'All Services' }
  const S3ServiceOption = { key: 's3', name: 'S3' }
  const ec2ServiceOption = { key: 'ec2', name: 'EC2' }
  const elastiCacheServiceOption = { key: 'elasticache', name: 'ElastiCache' }
  const rdsServiceOption = { key: 'rds', name: 'RDS' }
  const lambdaServiceOption = { key: 'lambda', name: 'Lambda' }
  const computeEngineServiceOption = { key: 'computeEngine', name: 'Compute Engine' }

  beforeEach(() => {
    mockSetFilters = jest.fn()
    filters = new Filters()
    page = render(<ServiceFilter filters={filters} setFilters={mockSetFilters} />)
  })

  it('has all services selected by default', async () => {
    expect(page.getByText('Services: 7 of 7')).toBeInTheDocument()
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
    assertCheckbox(page, 'Compute Engine', true)
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

    expect(page.getByText('Services: 0 of 7')).toBeInTheDocument()
    assertCheckbox(page, 'All Services', false)
    assertCheckbox(page, 'EBS', false)
    assertCheckbox(page, 'S3', false)
    assertCheckbox(page, 'EC2', false)
    assertCheckbox(page, 'ElastiCache', false)
    assertCheckbox(page, 'RDS', false)
    assertCheckbox(page, 'Lambda', false)
    assertCheckbox(page, 'Compute Engine', false)
  })

  it('updates the filters when an option is unselected', async () => {
    act(() => {
      fireEvent.click(page.getByLabelText('Open'))
    })
    act(() => {
      fireEvent.click(page.getByRole('checkbox-ebs'))
    })

    const newFilters = filters.withServices([
      allServiceOption,
      S3ServiceOption,
      ec2ServiceOption,
      elastiCacheServiceOption,
      rdsServiceOption,
      lambdaServiceOption,
      computeEngineServiceOption,
    ])
    expect(mockSetFilters).toHaveBeenCalledWith(newFilters)

    page.rerender(<ServiceFilter filters={newFilters} setFilters={mockSetFilters} />)

    expect(page.getByText('Services: 6 of 7')).toBeInTheDocument()
    assertCheckbox(page, 'All Services', false)
    assertCheckbox(page, 'EBS', false)
    assertCheckbox(page, 'S3', true)
    assertCheckbox(page, 'EC2', true)
    assertCheckbox(page, 'ElastiCache', true)
    assertCheckbox(page, 'RDS', true)
    assertCheckbox(page, 'Lambda', true)
    assertCheckbox(page, 'Compute Engine', true)
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
