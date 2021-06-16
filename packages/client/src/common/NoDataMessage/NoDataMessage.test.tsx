/*
 * © 2021 ThoughtWorks, Inc.
 */
import React from 'react'
import { render } from '@testing-library/react'

import NoDataMessage from './NoDataMessage'

describe('NoDataMessage', () => {
  test('renders when there is no cloud providers selected', () => {
    const { getByTestId } = render(<NoDataMessage isTop={true} />)
    expect(getByTestId('no-data-message')).toBeInTheDocument()
  })
})
