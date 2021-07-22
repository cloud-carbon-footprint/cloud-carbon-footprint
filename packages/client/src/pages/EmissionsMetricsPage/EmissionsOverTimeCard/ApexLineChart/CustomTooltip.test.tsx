/*
 * © 2021 Thoughtworks, Inc.
 */

import { create } from 'react-test-renderer'
import { render } from '@testing-library/react'
import CustomTooltip from './CustomTooltip'

describe('Custom Tooltip', () => {
  const cloudEstimatesPerDay = [
    {
      x: new Date('2020-12-01'),
      y: 10,
      usesAverageCPUConstant: false,
      kilowattHours: 100,
      cost: 5,
    },
    {
      x: new Date('2020-12-02'),
      y: 20,
      usesAverageCPUConstant: true,
      kilowattHours: 200,
      cost: 10,
    },
  ]

  it('renders data in tooltip', () => {
    const tooltip = create(
      <CustomTooltip dataPoint={cloudEstimatesPerDay[1]} />,
    )
    expect(tooltip.toJSON()).toMatchSnapshot()
  })

  it('should return empty tooltip if no data point', () => {
    const { container } = render(<CustomTooltip dataPoint={undefined} />)
    expect(container.firstChild).toBeEmpty()
  })

  it('should show an asterisk in label for a data point that uses an average CPU constant', () => {
    const { getByText } = render(
      <CustomTooltip dataPoint={cloudEstimatesPerDay[1]} />,
    )
    const expectedLabel = `${cloudEstimatesPerDay[1].y} metric tons CO2e*`

    expect(getByText(expectedLabel)).toBeInTheDocument()
  })

  it('should not show an asterisk for a data point that do not use an average CPU constant', () => {
    const { getByText } = render(
      <CustomTooltip dataPoint={cloudEstimatesPerDay[0]} />,
    )
    const expectedLabel = `${cloudEstimatesPerDay[0].y} metric tons CO2e`

    expect(getByText(expectedLabel)).toBeInTheDocument()
  })
})
