/*
 * © 2021 ThoughtWorks, Inc.
 */

import React from 'react'
import { create } from 'react-test-renderer'
import moment from 'moment'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import {
  CarbonComparisonCard,
  toGas,
  toMiles,
  toTrees,
} from './CarbonComparisonCard'
import { EstimationResult } from '../models/types'

const data = [
  {
    timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
    serviceEstimates: [
      {
        cloudProvider: 'AWS',
        accountName: 'testaccountname',
        serviceName: 'ebs',
        kilowattHours: 0,
        co2e: 5,
        cost: 0,
        region: 'us-west-2',
      },
      {
        cloudProvider: 'AWS',
        accountName: 'testaccountname',
        serviceName: 's3',
        kilowattHours: 0,
        co2e: 0,
        cost: 0,
        region: 'us-west-2',
      },
      {
        cloudProvider: 'AWS',
        accountName: 'testaccountname',
        serviceName: 'ec2',
        kilowattHours: 0,
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
    const { getByText, getByTestId } = render(
      <CarbonComparisonCard data={data} />,
    )

    const phonesButton = getByText('Phones')
    const flightsIcon = getByTestId('flightsIcon')
    expect(phonesButton).toBeInstanceOf(HTMLElement)
    expect(flightsIcon).toBeInstanceOf(SVGSVGElement)

    act(() => {
      fireEvent.click(phonesButton)
    })

    const phonesIcon = getByTestId('phonesIcon')
    expect(phonesIcon).toBeInstanceOf(SVGSVGElement)

    const treesButton = getByText('Trees')
    expect(treesButton).toBeInstanceOf(HTMLElement)

    act(() => {
      fireEvent.click(treesButton)
    })

    const treesIcon = getByTestId('treesIcon')
    expect(treesIcon).toBeInstanceOf(SVGSVGElement)

    const flightsButton = getByText('Flights')
    expect(flightsButton).toBeInstanceOf(HTMLElement)

    act(() => {
      fireEvent.click(flightsButton)
    })

    expect(flightsIcon).toBeInstanceOf(SVGSVGElement)
  })

  it('should show corresponding sources for each pane', async () => {
    const { getByTestId, getByText } = render(
      <CarbonComparisonCard data={data} />,
    )
    const source = getByTestId('epa-source')
    expect(source).toHaveTextContent(
      'Source: Flight Carbon Footprint Calculator',
    )

    const phonesButton = getByText('Phones')
    act(() => {
      fireEvent.click(phonesButton)
    })
    expect(source).toHaveTextContent('Source: EPA Equivalencies Calculator')

    const treesButton = getByText('Trees')
    act(() => {
      fireEvent.click(treesButton)
    })
    expect(source).toHaveTextContent('Source: EPA Equivalencies Calculator')

    const flightsButton = getByText('Flights')
    act(() => {
      fireEvent.click(flightsButton)
    })
    expect(source).toHaveTextContent(
      'Source: Flight Carbon Footprint Calculator',
    )
  })

  it('should open Flight Carbon Calculator page in other tab when clicking flight link', async () => {
    const { getByText } = render(<CarbonComparisonCard data={data} />)
    const epaLink = getByText('Flight Carbon Footprint Calculator').closest('a')
    expect(epaLink).toHaveAttribute(
      'href',
      'https://calculator.carbonfootprint.com/calculator.aspx?tab=3',
    )
    expect(epaLink).toHaveAttribute('target', '_blank')
    //for security reasons https://web.dev/external-anchors-use-rel-noopener/
    expect(epaLink).toHaveAttribute('rel', 'noopener')
  })

  it.only('should open EPA page in other tab when clicking EPA link', async () => {
    const { getByText } = render(<CarbonComparisonCard data={data} />)
    const phonesButton = getByText('Phones')
    act(() => {
      fireEvent.click(phonesButton)
    })
    const epaLink = getByText('EPA Equivalencies Calculator').closest('a')
    expect(epaLink).toHaveAttribute(
      'href',
      'https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator',
    )
    expect(epaLink).toHaveAttribute('target', '_blank')
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
              cloudProvider: 'AWS',
              accountName: 'testaccountname',
              serviceName: 'ebs',
              kilowattHours: 0,
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
      expect(co2).toHaveTextContent(
        co2e.toLocaleString(undefined, { maximumFractionDigits: 1 }),
      )
    })

    // TODO: Update this test for calculating flights instead of miles
    it('should format miles', async () => {
      const { getByTestId } = render(<CarbonComparisonCard data={data} />)
      const co2 = getByTestId('comparison')
      const expected = toMiles(co2kg).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })
      expect(co2).toHaveTextContent(expected)
    })

    // TODO: Update this test for calculating phones instead of gas
    it('should format gas', async () => {
      const { getByText, getByTestId } = render(
        <CarbonComparisonCard data={data} />,
      )
      act(() => {
        fireEvent.click(getByText('Gas'))
      })
      const co2 = getByTestId('comparison')
      const expected = toGas(co2kg).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })
      expect(co2).toHaveTextContent(expected)
    })

    it('should format trees', async () => {
      const { getByText, getByTestId } = render(
        <CarbonComparisonCard data={data} />,
      )
      act(() => {
        fireEvent.click(getByText('Trees'))
      })
      const co2 = getByTestId('comparison')
      const expected = toTrees(co2kg).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })
      expect(co2).toHaveTextContent(expected)
    })
  })
})
