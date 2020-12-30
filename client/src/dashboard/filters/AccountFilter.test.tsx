/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { render, RenderResult } from '@testing-library/react'
import React, { Dispatch, SetStateAction } from 'react'
import AccountFilter from './AccountFilter'
import { Filters } from './Filters'
describe('AccountFilter', () => {
  let page: RenderResult
  const account = [{ cloudProvider: 'AWS', key: '1212121222121', name: 'test account' }]
  jest.mock('./Filters', () => {
    return jest.fn().mockImplementation(() => {
      return {
        accountLabel: 'Accounts: 1 of 1',
        accounts: [
          {
            cloudProvider: 'AWS',
            key: '1212121222121',
            name: 'test account',
          },
        ],
        withAccounts: jest.fn(),
      }
    })
  })

  beforeEach(() => {
    const mockSetFilters: jest.Mocked<Dispatch<SetStateAction<Filters>>> = jest.fn()
    const mockFilters = new Filters()
    page = render(<AccountFilter filters={mockFilters} setFilters={mockSetFilters} options={{ accounts: account }} />)
  })

  it('displays the account filter dropdown', () => {
    expect(page.getByText('Accounts: 1 of 1')).toBeInTheDocument()
  })
})
