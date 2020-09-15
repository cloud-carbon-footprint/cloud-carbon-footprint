import React from 'react'
import { create } from 'react-test-renderer'
import moment from 'moment'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { CarbonComparisonCard } from './CarbonComparisonCard'
import { EstimationResult } from '../types'

const data = [
  {
    timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
    serviceEstimates: [
      {
        serviceName: 'ebs',
        wattHours: 0,
        co2e: 5,
        cost: 0,
        region: 'us-west-2',
      },
      {
        serviceName: 's3',
        wattHours: 0,
        co2e: 0,
        cost: 0,
        region: 'us-west-2',
      },
      {
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
    const { getByText, getByTestId } = render(<CarbonComparisonCard data={data} />)

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

  describe('number formatting', () => {
    let data: EstimationResult[]
    beforeEach(() => {
      data = [
        {
          timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
          serviceEstimates: [
            {
              serviceName: 'ebs',
              wattHours: 0,
              co2e: 10000,
              cost: 0,
              region: 'us-west-2',
            },
          ],
        },
      ]
    })

    it('should format 999999.99999 CO2 number to 999,999.9', async () => {
      data[0].serviceEstimates[0].co2e = 999999.55555555555
      const { getByTestId } = render(<CarbonComparisonCard data={data} />)
      const co2 = getByTestId('co2')
      expect(co2).toHaveTextContent('999,999.6')
    })

    it('should format miles', async () => {
      const { getByTestId } = render(<CarbonComparisonCard data={data} />)
      const co2 = getByTestId('comparison')
      expect(co2).toHaveTextContent('24,813.9')
    })

    it('should format gas', async () => {
      const { getByText, getByTestId } = render(<CarbonComparisonCard data={data} />)
      act(() => {
        fireEvent.click(getByText('Gas'))
      })
      const co2 = getByTestId('comparison')
      expect(co2).toHaveTextContent('1,125.2')
    })

    it('should format trees', async () => {
      const { getByText, getByTestId } = render(<CarbonComparisonCard data={data} />)
      act(() => {
        fireEvent.click(getByText('Trees'))
      })
      const co2 = getByTestId('comparison')
      expect(co2).toHaveTextContent('165.4')
    })
  })
})
