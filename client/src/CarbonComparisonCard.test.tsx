import React from 'react'
import { create } from 'react-test-renderer'
import moment from 'moment'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { CarbonComparisonCard } from './CarbonComparisonCard'

const data = [
  {
    timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
    serviceEstimates: [
      {
        timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
        serviceName: 'ebs',
        wattHours: 0,
        co2e: 5,
        cost: 0,
        region: 'us-west-2',
      },
      {
        timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
        serviceName: 's3',
        wattHours: 0,
        co2e: 0,
        cost: 0,
        region: 'us-west-2',
      },
      {
        timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
        serviceName: 'ec2',
        wattHours: 0,
        co2e: 2,
        cost: 0,
        region: 'us-west-2',
      },
    ],
  },
]

describe('CarbonComparisonCard', () => {
  it('renders with correct configuration', () => {
    const root = create(<CarbonComparisonCard data={data} />)

    expect(root.toJSON()).toMatchSnapshot()
  })

  it('selects carbon comparison correctly', async () => {
    const {
      getByText,
      getByTestId,
    } = render(<CarbonComparisonCard data={data} />)

    const gasButton = getByText('Gas')
    const milesIcon = getByTestId('milesIcon')
    expect(gasButton).toBeInstanceOf(HTMLElement)
    expect(milesIcon).toBeInstanceOf(SVGSVGElement)

    act(() => {
      fireEvent.click(gasButton)
    })

    const gasIcon = getByTestId('gasIcon')
    expect(gasIcon).toBeInstanceOf(SVGSVGElement)

    const treesButton = getByText('Trees')
    expect(treesButton).toBeInstanceOf(HTMLElement)

    act(() => {
      fireEvent.click(treesButton)
    })

    const treesIcon = getByTestId('treesIcon')
    expect(treesIcon).toBeInstanceOf(SVGSVGElement)

    const milesButton = getByText('Miles')
    expect(milesButton).toBeInstanceOf(HTMLElement)

    act(() => {
      fireEvent.click(milesButton)
    })

    expect(milesIcon).toBeInstanceOf(SVGSVGElement)
  })
})