/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { create } from 'react-test-renderer'
import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import SidePanel from './SidePanel'

describe('Side Bar', () => {
  it('renders', () => {
    const root = create(<SidePanel drawerWidth={1} title={''} children="" />)
    expect(root.toJSON()).toMatchSnapshot()
  })

  it('opens and closes drawer correctly', async () => {
    const { getByTestId } = render(
      <SidePanel drawerWidth={1} title={''} children="" />,
    )
    const infoIcon = getByTestId('infoIcon')
    const carbonFormulaTitle = getByTestId('sideBarTitle')

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
