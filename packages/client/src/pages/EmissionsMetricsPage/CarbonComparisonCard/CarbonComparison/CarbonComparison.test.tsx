/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { create } from 'react-test-renderer'
import CarbonComparison from './CarbonComparison'
import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

describe('CarbonComparison', () => {
  const FakeIcon = () => <div />
  const exampleComparisons = {
    optionOne: {
      icon: <FakeIcon />,
      total: 23,
      textOne: 'CO2e emissions from',
      textTwo: 'optionOne comparison',
      source: { href: '', title: 'optionOneSource' },
    },
    optionTwo: {
      icon: <FakeIcon />,
      total: 150,
      textOne: 'CO2e emissions from',
      textTwo: 'optionTwo comparison',
      source: { href: '', title: 'optionTwoSource' },
    },
  }

  const testProps = {
    formatNumber: jest.fn(),
    totalMetricTons: 100,
    comparisons: exampleComparisons,
    selection: 'optionOne',
    updateSelection: jest.fn(),
    updateButtonColor: jest.fn(),
  }

  it('renders with correct configuration and markup', () => {
    const root = create(<CarbonComparison {...testProps} />)

    expect(root.toJSON()).toMatchSnapshot()
  })

  it('calls the number formatter on the passed metric tons and comparison total', () => {
    render(<CarbonComparison {...testProps} />)

    expect(testProps.formatNumber).toHaveBeenCalledTimes(2)
    expect(testProps.formatNumber).toHaveBeenCalledWith(
      testProps.totalMetricTons,
      1,
    )
    expect(testProps.formatNumber).toHaveBeenCalledWith(
      testProps.comparisons.optionOne.total,
    )
  })

  it('calls the updateSelection function when an option is selected from the dropdown', () => {
    const { getByText } = render(<CarbonComparison {...testProps} />)

    const optionOneButton = getByText('optionOne')
    act(() => {
      fireEvent.click(optionOneButton)
    })

    expect(testProps.updateSelection).toHaveBeenCalledTimes(1)
    expect(testProps.updateSelection).toHaveBeenCalledWith('optionOne')
  })

  it('calls the updateButtonColor when rendering each option button', () => {
    render(<CarbonComparison {...testProps} />)

    expect(testProps.updateButtonColor).toHaveBeenCalledTimes(2)
    expect(testProps.updateButtonColor).toHaveBeenCalledWith('optionOne')
    expect(testProps.updateButtonColor).toHaveBeenCalledWith('optionTwo')
  })

  it('displays the selected comparison information and the rest of the prop data', () => {
    const { getByText, getByRole, getAllByRole } = render(
      <CarbonComparison {...testProps} />,
    )

    const selected = testProps.comparisons[testProps.selection]
    const buttons = getAllByRole('button')

    expect(getByText(selected.textOne)).toBeInTheDocument()
    expect(getByText(selected.textTwo)).toBeInTheDocument()
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toHaveTextContent('optionOne')
    expect(buttons[1]).toHaveTextContent('optionTwo')
    expect(getByRole('link')).toHaveTextContent(selected.source.title)
    expect(getByRole('link')).toHaveAttribute('href', selected.source.href)
  })
})
