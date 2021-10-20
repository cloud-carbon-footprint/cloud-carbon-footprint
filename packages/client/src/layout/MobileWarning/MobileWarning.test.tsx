/*
 * © 2021 Thoughtworks, Inc.
 */

import { fireEvent, render } from '@testing-library/react'
import MobileWarning from './MobileWarning'

describe('Mobile Warning', () => {
  const handleClose = jest.fn()

  it('renders a modal as its container', () => {
    const { getByTestId } = render(<MobileWarning />)

    expect(getByTestId('warning-modal')).toBeInTheDocument()
  })

  it('renders the correct header', () => {
    const { getByText } = render(<MobileWarning />)

    expect(getByText('Proceed with Caution!')).toBeInTheDocument()
  })

  it('renders the correct message', () => {
    const { getByText } = render(<MobileWarning />)
    const message =
      'This app is not intended for use on smaller devices. For the best experience, please view it on a larger screen.'

    expect(getByText(message)).toBeInTheDocument()
  })

  it('renders a warning icon', () => {
    const { getByTestId } = render(<MobileWarning />)

    expect(getByTestId('warning-icon')).toBeInTheDocument()
  })

  it('renders a close button and class the assigned function when clicked', () => {
    const { getByRole } = render(<MobileWarning handleClose={handleClose} />)

    const closeButton = getByRole('button')
    fireEvent.click(closeButton)

    expect(handleClose).toHaveBeenCalled()
  })
})
