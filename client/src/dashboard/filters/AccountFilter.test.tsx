/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { render, RenderResult } from '@testing-library/react'
import React from 'react'
import AccountFilter from './AccountFilter'

describe('AccountFilter', () => {
  let page: RenderResult
  beforeEach(() => {
    // mockSetFilters = jest.fn()
    // filters = new Filters()
    page = render(<AccountFilter />)
  })
  it('displays the account filter dropdown', () => {
    expect(page.getByText('Accounts:')).toBeInTheDocument()
  })
})
