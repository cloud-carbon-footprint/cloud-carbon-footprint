/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React from 'react'
import { create } from 'react-test-renderer'
import moment from 'moment'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { CarbonComparisonCard, toGas, toMiles, toTrees } from './CarbonComparisonCard'
import { EstimationResult } from '../models/types'

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

  it('should show EPA source', async () => {
    const { getByTestId } = render(<CarbonComparisonCard data={data} />)
    const source = getByTestId('epa-source')
    expect(source).toHaveTextContent('Source: EPA Equivalencies Calculator')
  })

  it('should open EPA page in other tab when clicking EPA link', async () => {
    const { getByText } = render(<CarbonComparisonCard data={data} />)
    const epaLink = getByText('EPA Equivalencies Calculator').closest('a')
    expect(epaLink).toHaveAttribute('href', 'https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator')
    expect(epaLink).toHaveAttribute('target', '_blank')
    //for security reasons https://web.dev/external-anchors-use-rel-noopener/
    expect(epaLink).toHaveAttribute('rel', 'noopener')
  })

  describe('number formatting', () => {
    let data: EstimationResult[]
    let co2kg: number
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
      co2kg = data[0].serviceEstimates[0].co2e
    })

    it('should format co2e to default locale integer', async () => {
      const co2e = 999999.55555555555
      data[0].serviceEstimates[0].co2e = co2e
      const { getByTestId } = render(<CarbonComparisonCard data={data} />)
      const co2 = getByTestId('co2')
      expect(co2).toHaveTextContent(co2e.toLocaleString(undefined, { maximumFractionDigits: 0 }))
    })

    it('should format miles', async () => {
      const { getByTestId } = render(<CarbonComparisonCard data={data} />)
      const co2 = getByTestId('comparison')
      const expected = toMiles(co2kg).toLocaleString(undefined, { maximumFractionDigits: 0 })
      expect(co2).toHaveTextContent(expected)
    })

    it('should format gas', async () => {
      const { getByText, getByTestId } = render(<CarbonComparisonCard data={data} />)
      act(() => {
        fireEvent.click(getByText('Gas'))
      })
      const co2 = getByTestId('comparison')
      const expected = toGas(co2kg).toLocaleString(undefined, { maximumFractionDigits: 0 })
      expect(co2).toHaveTextContent(expected)
    })

    it('should format trees', async () => {
      const { getByText, getByTestId } = render(<CarbonComparisonCard data={data} />)
      act(() => {
        fireEvent.click(getByText('Trees'))
      })
      const co2 = getByTestId('comparison')
      const expected = toTrees(co2kg).toLocaleString(undefined, { maximumFractionDigits: 0 })
      expect(co2).toHaveTextContent(expected)
    })
  })
})
