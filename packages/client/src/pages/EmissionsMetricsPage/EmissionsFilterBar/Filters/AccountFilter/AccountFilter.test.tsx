/*
 * © 2021 Thoughtworks, Inc.
 */

import { fireEvent, act, render } from '@testing-library/react'
import React from 'react'
import AccountFilter from './AccountFilter'
import {
  Filters,
  filtersConfigGenerator,
} from '../../../../../common/FilterBar/utils/Filters'
import { FilterOptions } from 'Types'

describe('AccountFilter', () => {
  it('displays the account filter dropdown', async () => {
    const account = [
      { cloudProvider: 'aws', key: '1212121222121', name: 'test account' },
    ]
    const filteredDataResults = { accounts: account, services: [] }
    const mockFilters = new Filters(filtersConfigGenerator(filteredDataResults))
    const filterOptions: FilterOptions = {
      accounts: [
        { key: 'all', name: 'All Accounts', cloudProvider: '' },
        account[0],
      ],
      services: [],
    }

    const page = render(
      <AccountFilter
        filters={mockFilters}
        setFilters={jest.fn}
        options={filterOptions}
      />,
    )

    act(() => {
      fireEvent.click(page.getByLabelText('Open'))
    })

    expect(page.getByText('Accounts: 1 of 1')).toBeInTheDocument()
    expect(page.getByText('AWS: 1 of 1')).toBeInTheDocument()
  })
})
