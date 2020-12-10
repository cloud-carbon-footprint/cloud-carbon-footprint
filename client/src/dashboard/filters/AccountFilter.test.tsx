/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { act, fireEvent, render, RenderResult } from '@testing-library/react'
import React, { Dispatch, SetStateAction } from 'react'
import AccountFilter from './AccountFilter'
import { Filters } from './Filters'
describe('AccountFilter', () => {
  let page: RenderResult
  const account = [{ cloudProvider: 'AWS', key: '1212121222121', name: 'test account' }]

  beforeEach(() => {
    const mockSetFilters: jest.Mocked<Dispatch<SetStateAction<Filters>>> = jest.fn()
    const withTimeFrame = jest.fn()
    const withServices = jest.fn()
    const withAccounts = jest.fn()
    const withCloudProviders = jest.fn()
    const withDateRange = jest.fn()
    const getDesiredKeysFromCurrentFilteredKeys = jest.fn()
    const handleSelections = jest.fn()
    const filter = jest.fn()
    const getResultsFilteredByAccount = jest.fn()
    const getResultsFilteredByService = jest.fn()
    const getResultsFilteredByTime = jest.fn()
    const addAllDropDownOption = jest.fn()
    const serviceTypesInAccountSelection = jest.fn()
    const filters = {
      timeframe: 0,
      services: [],
      cloudProviders: [],
      dateRange: null,
      accounts: account,
      withTimeFrame,
      withServices,
      withAccounts,
      withCloudProviders,
      withDateRange,
      getDesiredKeysFromCurrentFilteredKeys,
      handleSelections,
      numSelectedLabel: () => '',
      serviceLabel: () => '',
      cloudProviderLabel: () => '',
      accountLabel: () => 'Accounts:',
      filter,
      getResultsFilteredByAccount,
      getResultsFilteredByService,
      getResultsFilteredByTime,
      addAllDropDownOption,
      serviceTypesInAccountSelection,
    }
    page = render(<AccountFilter filters={filters} setFilters={mockSetFilters} options={{ accounts: account }} />)
  })

  it('displays the account filter dropdown', () => {
    expect(page.getByText('Accounts:')).toBeInTheDocument()
  })

  xit('displays the options when opened', async () => {
    act(() => {
      fireEvent.click(page.getByLabelText('Open'))
    })

    assertCheckbox(page, 'All Accounts', true)
    assertCheckbox(page, 'test account', true)
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
