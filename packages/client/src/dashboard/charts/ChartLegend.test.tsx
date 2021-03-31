import React from 'react'
import { render, screen } from '@testing-library/react'
import ChartLegend from './ChartLegend'

describe('ChartLegend', () => {
  it('Sould render component', () => {
    const props = {
      startLabel: 'Very low intensity',
      endLabel: 'Very high intensity',
      colorRange: ['#73B500', '#00791E'],
    }

    render(<ChartLegend {...props} />)

    expect(screen.getAllByTestId('timeline-dot').length).toBe(2)
    expect(screen.getByText(props.startLabel)).toBeInTheDocument()
    expect(screen.getByText(props.endLabel)).toBeInTheDocument()
  })
})
