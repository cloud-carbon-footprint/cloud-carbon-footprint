/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { Dispatch, SetStateAction } from 'react'
import { fireEvent, render, RenderResult, act } from '@testing-library/react'

import ServiceFilter from './ServiceFilter'
import { Filters } from 'common/FilterBar/utils/Filters'
import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import {
  ALL_SERVICES_DROPDOWN_OPTION,
  buildAndOrderDropdownOptions,
  CLOUD_PROVIDER_OPTIONS,
} from 'common/FilterBar/utils/DropdownConstants'
import { EmissionsFilters } from '../../utils/EmissionsFilters'

jest.mock('ConfigLoader', () => {
  return jest.fn().mockImplementation(() => {
    return {
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
  const S3ServiceOption = { key: 's3', name: 'S3', cloudProvider: 'aws' }
  const ebsServiceOption = { key: 'ebs', name: 'EBS', cloudProvider: 'aws' }
  const ec2ServiceOption = { key: 'ec2', name: 'EC2', cloudProvider: 'aws' }
  const elastiCacheServiceOption = {
    key: 'elasticache',
    name: 'ElastiCache',
    cloudProvider: 'aws',
  }
  const rdsServiceOption = { key: 'rds', name: 'RDS', cloudProvider: 'aws' }
  const lambdaServiceOption = {
    key: 'lambda',
    name: 'Lambda',
    cloudProvider: 'aws',
  }
  const computeEngineServiceOption = {
    key: 'computeEngine',
    name: 'Compute Engine',
    cloudProvider: 'gcp',
  }
  const services = [
    ebsServiceOption,
    S3ServiceOption,
    ec2ServiceOption,
    elastiCacheServiceOption,
    rdsServiceOption,
    lambdaServiceOption,
    computeEngineServiceOption,
  ]
  const filteredDataResults = { accounts: [], services }
  // Builds the service options the same way as FilterBar
  const allServiceDropdownOptions = buildAndOrderDropdownOptions(services, [
    { key: '', name: '' },
  ])
  const serviceOptions: DropdownOption[] = [
    ALL_SERVICES_DROPDOWN_OPTION,
    ...allServiceDropdownOptions,
  ]
  const filterOptions: FilterOptions = {
    accounts: [
      { key: 'all', name: 'All Accounts', cloudProvider: '' },
      { key: '321321321', name: 'testaccount0', cloudProvider: 'aws' },
      { key: '123123123', name: 'testaccount1', cloudProvider: 'gcp' },
    ],
    services: serviceOptions,
    cloudProviders: CLOUD_PROVIDER_OPTIONS,
  }

  beforeEach(() => {
    mockSetFilters = jest.fn()
    const filterConfig = EmissionsFilters.generateConfig(filteredDataResults)
    filters = new EmissionsFilters(filterConfig)
    page = render(
      <ServiceFilter
        filters={filters}
        setFilters={mockSetFilters}
        options={filterOptions}
      />,
    )
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

    const newFilters = filters.withDropdownOption(
      [],
      filterOptions,
      DropdownFilterOptions.SERVICES,
    )
    expect(mockSetFilters).toHaveBeenCalledWith(newFilters)

    page.rerender(
      <ServiceFilter
        filters={newFilters}
        setFilters={mockSetFilters}
        options={filterOptions}
      />,
    )

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

    const newFilters = filters.withDropdownOption(
      [
        allServiceOption,
        ec2ServiceOption,
        elastiCacheServiceOption,
        lambdaServiceOption,
        rdsServiceOption,
        S3ServiceOption,
        computeEngineServiceOption,
      ],
      filterOptions,
      DropdownFilterOptions.SERVICES,
    )
    expect(mockSetFilters).toHaveBeenCalledWith(newFilters)

    page.rerender(
      <ServiceFilter
        filters={newFilters}
        setFilters={mockSetFilters}
        options={filterOptions}
      />,
    )

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

  it('groupBy display of aws is shown with selection out of total', () => {
    act(() => {
      fireEvent.click(page.getByLabelText('Open'))
    })
    const allAwsGroupByElement = page.getByText('AWS: 6 of 6')
    const allGcpGroupByElement = page.getByText('GCP: 1 of 1')
    expect(allAwsGroupByElement).toBeInTheDocument()
    expect(allGcpGroupByElement).toBeInTheDocument()

    const someAwsFilters = filters.withDropdownOption(
      [
        allServiceOption,
        ec2ServiceOption,
        elastiCacheServiceOption,
        lambdaServiceOption,
        rdsServiceOption,
        S3ServiceOption,
      ],
      filterOptions,
      DropdownFilterOptions.SERVICES,
    )

    page.rerender(
      <ServiceFilter
        filters={someAwsFilters}
        setFilters={mockSetFilters}
        options={filterOptions}
      />,
    )

    const someAwsGroupByElement = page.getByText('AWS: 5 of 6')
    const noGcpGroupByElement = page.getByText('GCP: 0 of 1')
    expect(someAwsGroupByElement).toBeInTheDocument()
    expect(noGcpGroupByElement).toBeInTheDocument()
  })

  const assertCheckbox = (
    page: RenderResult,
    option: string,
    selected: boolean,
  ) => {
    const li = page.getByText(option)

    if (selected) {
      expect(li.firstChild).toHaveClass('Mui-checked')
    } else {
      expect(li.firstChild).not.toHaveClass('Mui-checked')
    }
  }
})
