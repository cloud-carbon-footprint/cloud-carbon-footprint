/*
 * © 2021 Thoughtworks, Inc.
 */

import each from 'jest-each'
import { create } from 'react-test-renderer'
import { render } from '@testing-library/react'
import config from 'ConfigLoader'
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
    {
      x: new Date('2021-11-01'),
      y: 20,
      usesAverageCPUConstant: true,
      kilowattHours: 200,
      cost: 10,
    },
  ]

  // TODO: Fix this mock, for some reason it's being ignored
  jest.mock('ConfigLoader', () => ({
    __esModule: true,
    default: () => ({
      GROUP_BY: 'day',
    }),
  }))

  it('renders data in tooltip', () => {
    config().GROUP_BY = 'day'
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

  describe('Show tooltip title according to group by param', () => {
    each([
      ['2021', 'year'],
      ['4th Quarter, 2021', 'quarter'],
      ['November, 2021', 'month'],
      ['Week 45, November', 'week'],
      ['November 01, 2021', 'day'],
    ]).it('should show %s when grouping by %s', (expectedLabel, grouping) => {
      config().GROUP_BY = grouping

      const { getByText } = render(
        <CustomTooltip dataPoint={cloudEstimatesPerDay[2]} />,
      )

      expect(getByText(expectedLabel)).toBeInTheDocument()
    })
  })
})
