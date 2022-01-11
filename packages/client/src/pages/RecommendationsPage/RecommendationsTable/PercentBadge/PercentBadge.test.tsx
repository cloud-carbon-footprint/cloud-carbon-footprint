/*
 * © 2021 Thoughtworks, Inc.
 */

import { render } from '@testing-library/react'
import each from 'jest-each'
import PercentBadge from './PercentBadge'

describe('PercentBadge', () => {
  it('should render number passed to it as percentage', () => {
    const { getByText } = render(<PercentBadge amount={25} />)

    expect(getByText('25%')).toBeInTheDocument()
  })

  it('should render a decrease icon', () => {
    const { getByTestId } = render(<PercentBadge amount={25} />)

    expect(getByTestId('decrease-arrow')).toBeInTheDocument()
  })

  it('should render an increase icon when amount is negative percentage', () => {
    const { queryByTestId, getByText } = render(<PercentBadge amount={-25} />)

    expect(getByText('25%')).toBeInTheDocument()
    expect(queryByTestId('decrease-arrow')).toBeFalsy()
    expect(queryByTestId('increase-arrow')).toBeInTheDocument()
  })

  const testParams = [
    [0, '0%'],
    [null, '-'],
    [undefined, '-'],
  ]
  each(testParams).it(
    'should render a neutral icon when a percentage is %s',
    (percentageAmount, expectedResult) => {
      const { queryByTestId, getByTestId } = render(
        <PercentBadge amount={percentageAmount} />,
      )

      expect(getByTestId('percentage-badge-label').innerHTML).toBe(
        expectedResult,
      )

      const expectedArrow =
        percentageAmount === 0 ? 'flat-arrow' : 'decrease-arrow'

      expect(queryByTestId(expectedArrow)).toBeInTheDocument()
    },
  )
})
