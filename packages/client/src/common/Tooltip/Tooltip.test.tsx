/*
 * © 2021 Thoughtworks, Inc.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Tooltip from './Tooltip'

describe('Tooltip', () => {
  it('should render', () => {
    const { getByTestId } = render(<Tooltip message={'test'} />)
    expect(getByTestId('tooltip')).toBeInTheDocument()
  })

  it('should show message on mouse over and disappear on mouse out', async () => {
    const testMessage = 'test message'
    const { getByText } = render(<Tooltip message={testMessage} />)
    fireEvent.mouseOver(screen.getByTestId('tooltip'))

    await waitFor(() => {
      expect(getByText(testMessage)).toBeVisible()
    })

    fireEvent.mouseOut(screen.getByTestId('tooltip'))

    await waitFor(() => {
      expect(getByText(testMessage)).not.toBeVisible()
    })
  })
})
