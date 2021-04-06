/*
 * © 2021 ThoughtWorks, Inc.
 */
import React from 'react'
import { render } from '@testing-library/react'

import NoDataPage from './NoDataPage'

describe('NoDataPage', () => {
  test('renders when there is no cloud providers selected', () => {
    const { getByTestId } = render(<NoDataPage isTop={true} />)
    expect(getByTestId('no-data-page')).toBeInTheDocument()
  })
})
