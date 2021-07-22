/*
 * © 2021 Thoughtworks, Inc.
 */
import React from 'react'
import { render } from '@testing-library/react'
import NoDataMessage from './NoDataMessage'
import shruggingCloud from './V1Shrugging-cloud-icon.svg'
import emptyStateIcon from './V1Empty-state-generic-icon.svg'

describe('NoDataMessage', () => {
  const isTopMessage =
    '(Try adding accounts, services or expanding the date range)'

  it('renders when there is no cloud providers selected', () => {
    const { getByTestId } = render(<NoDataMessage isTop />)
    expect(getByTestId('no-data-message')).toBeInTheDocument()
  })

  it('shows a shrugging cloud image and an additional message if the isTop prop is true', () => {
    const { getByRole, getByText } = render(<NoDataMessage isTop />)
    expect(getByRole('img')).toHaveAttribute('src', shruggingCloud)
    expect(getByText(isTopMessage)).toBeTruthy()
  })

  it('shows an empty box image with no additional message if the isTop prop is false', () => {
    const { getByRole, queryByText } = render(<NoDataMessage />)
    expect(getByRole('img')).toHaveAttribute('src', emptyStateIcon)
    expect(queryByText(isTopMessage)).toBeFalsy()
  })
})
