/*
 * © 2021 ThoughtWorks, Inc.
 */

import { fireEvent, act, render, RenderResult } from '@testing-library/react'
import React, { Dispatch, SetStateAction } from 'react'
import AccountFilter from './AccountFilter'
import { Filters } from '../utils/Filters'

jest.mock('../utils/Filters')

describe('AccountFilter', () => {
  let page: RenderResult
  let mockSetFilters: jest.Mocked<Dispatch<SetStateAction<Filters>>>
  let mockFilters: Filters
  const account = [
    { cloudProvider: 'aws', key: '1212121222121', name: 'test account' },
  ]
  beforeEach(() => {
    mockFilters = new Filters()
    mockSetFilters = jest.fn()
    page = render(
      <AccountFilter
        filters={mockFilters}
        setFilters={mockSetFilters}
        options={{ accounts: account, services: [] }}
      />,
    )
  })

  it('displays the account filter dropdown', async () => {
    act(() => {
      fireEvent.click(page.getByLabelText('Open'))
    })
    expect(page.getByText('Accounts: 1 of 1')).toBeInTheDocument()
    expect(page.getByText('AWS: 1 of 1')).toBeInTheDocument()
  })
})
