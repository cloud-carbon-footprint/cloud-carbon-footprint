/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React from 'react'
import { create } from 'react-test-renderer'
import { CarbonFormulaDrawer } from './CarbonFormulaDrawer'
import { fireEvent, render } from '@testing-library/react'

import { act } from 'react-dom/test-utils'

describe('CarbonFormulaDrawer', () => {
  it('renders', () => {
    const root = create(<CarbonFormulaDrawer />)
    expect(root.toJSON()).toMatchSnapshot()
  })

  it('opens and closes drawer correctly', async () => {
    const { getByText, getByTestId } = render(<CarbonFormulaDrawer />)
    const infoIcon = getByTestId('infoIcon')
    const carbonFormulaTitle = getByText('How do we get our carbon estimates?')

    expect(carbonFormulaTitle).not.toBeVisible()
    expect(infoIcon).toBeInstanceOf(SVGSVGElement)

    act(() => {
      fireEvent.click(infoIcon)
    })

    const closeIcon = getByTestId('closeIcon')
    expect(closeIcon).toBeInstanceOf(SVGSVGElement)
    expect(carbonFormulaTitle).toBeVisible()

    act(() => {
      fireEvent.click(closeIcon)
    })

    expect(carbonFormulaTitle).not.toBeVisible()
    expect(infoIcon).toBeVisible()
  })
})
