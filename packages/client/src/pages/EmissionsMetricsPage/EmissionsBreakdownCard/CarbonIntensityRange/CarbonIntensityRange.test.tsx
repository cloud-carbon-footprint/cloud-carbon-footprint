/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import CarbonIntensityRange from './CarbonIntensityRange'

describe('ChartLegend', () => {
  it('Should render component', () => {
    const props = {
      startLabel: 'Low carbon intensity',
      endLabel: 'High carbon intensity',
      colorRange: ['#73B500', '#00791E'],
    }

    render(<CarbonIntensityRange {...props} />)

    expect(screen.getAllByTestId('timeline-dot').length).toBe(2)
    expect(screen.getByText(props.startLabel)).toBeInTheDocument()
    expect(screen.getByText(props.endLabel)).toBeInTheDocument()
  })
})
