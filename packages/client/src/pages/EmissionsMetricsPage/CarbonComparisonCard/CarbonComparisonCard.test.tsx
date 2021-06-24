/*
 * © 2021 ThoughtWorks, Inc.
 */

import React from 'react'
import { create } from 'react-test-renderer'
import moment from 'moment'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import CarbonComparisonCard, {
  toTrees,
  toFlights,
} from './CarbonComparisonCard'

const data: EstimationResult[] = [
  {
    timestamp: moment('2019-08-10T00:00:00.000Z').toDate(),
    serviceEstimates: [
      {
        cloudProvider: 'AWS',
        accountId: 'testaccountid',
        accountName: 'testaccountname',
        serviceName: 'ebs',
        kilowattHours: 0,
        co2e: 5,
        cost: 0,
        region: 'us-west-2',
      },
      {
        cloudProvider: 'AWS',
        accountId: 'testaccountid',
        accountName: 'testaccountname',
        serviceName: 's3',
        kilowattHours: 0,
        co2e: 0,
        cost: 0,
        region: 'us-west-2',
      },
      {
        cloudProvider: 'AWS',
        accountId: 'testaccountid',
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
  const testContainerClass = 'test-container-class'

  it('renders with correct configuration', () => {
    const root = create(
      <CarbonComparisonCard containerClass={testContainerClass} data={data} />,
    )

    expect(root.toJSON()).toMatchSnapshot()
  })

  it('selects carbon comparison correctly', async () => {
    const { getByText, getByTestId } = render(
      <CarbonComparisonCard containerClass={testContainerClass} data={data} />,
    )

    const phonesButton = getByText('phones')
    const flightsIcon = getByTestId('flightsIcon')
    expect(phonesButton).toBeInstanceOf(HTMLElement)
    expect(flightsIcon).toBeInstanceOf(SVGSVGElement)

    act(() => {
      fireEvent.click(phonesButton)
    })

    const phonesIcon = getByTestId('phonesIcon')
    expect(phonesIcon).toBeInstanceOf(SVGSVGElement)

    const treesButton = getByText('trees')
    expect(treesButton).toBeInstanceOf(HTMLElement)

    act(() => {
      fireEvent.click(treesButton)
    })

    const treesIcon = getByTestId('treesIcon')
    expect(treesIcon).toBeInstanceOf(SVGSVGElement)

    const flightsButton = getByText('flights')
    expect(flightsButton).toBeInstanceOf(HTMLElement)

    act(() => {
      fireEvent.click(flightsButton)
    })

    expect(flightsIcon).toBeInstanceOf(SVGSVGElement)
  })

  it('should show corresponding sources for each pane', async () => {
    const { getByTestId, getByText } = render(
      <CarbonComparisonCard containerClass={testContainerClass} data={data} />,
    )
    const source = getByTestId('epa-source')
    expect(source).toHaveTextContent(
      'Source: Flight Carbon Footprint Calculator',
    )

    const phonesButton = getByText('phones')
    act(() => {
      fireEvent.click(phonesButton)
    })
    expect(source).toHaveTextContent('Source: EPA Equivalencies Calculator')

    const treesButton = getByText('trees')
    act(() => {
      fireEvent.click(treesButton)
    })
    expect(source).toHaveTextContent('Source: EPA Equivalencies Calculator')

    const flightsButton = getByText('flights')
    act(() => {
      fireEvent.click(flightsButton)
    })
    expect(source).toHaveTextContent(
      'Source: Flight Carbon Footprint Calculator',
    )
  })

  it('should open Flight Carbon Calculator page in other tab when clicking flight link', async () => {
    const { getByText } = render(
      <CarbonComparisonCard containerClass={testContainerClass} data={data} />,
    )
    const epaLink = getByText('Flight Carbon Footprint Calculator').closest('a')
    expect(epaLink).toHaveAttribute(
      'href',
      'https://calculator.carbonfootprint.com/calculator.aspx?tab=3',
    )
    expect(epaLink).toHaveAttribute('target', '_blank')
    //for security reasons https://web.dev/external-anchors-use-rel-noopener/
    expect(epaLink).toHaveAttribute('rel', 'noopener')
  })

  it('should open EPA page in other tab when clicking EPA link', async () => {
    const { getByText } = render(
      <CarbonComparisonCard containerClass={testContainerClass} data={data} />,
    )
    const phonesButton = getByText('phones')
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
              accountId: 'testaccountid',
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
      const { getByTestId } = render(
        <CarbonComparisonCard
          containerClass={testContainerClass}
          data={data}
        />,
      )
      const co2 = getByTestId('co2')
      expect(co2).toHaveTextContent(
        co2e.toLocaleString(undefined, { maximumFractionDigits: 1 }),
      )
    })

    it('should format flights', async () => {
      const { getByTestId } = render(
        <CarbonComparisonCard
          containerClass={testContainerClass}
          data={data}
        />,
      )
      const co2 = getByTestId('comparison')
      const expected = toFlights(co2kg).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })
      expect(co2).toHaveTextContent(expected)
    })

    it('should format number of phones that are less than a million', async () => {
      data[0].serviceEstimates[0].co2e = 8
      const { getByText, getByTestId } = render(
        <CarbonComparisonCard
          containerClass={testContainerClass}
          data={data}
        />,
      )
      act(() => {
        fireEvent.click(getByText('phones'))
      })
      const co2 = getByTestId('comparison')
      const expected = '973,144'
      expect(co2).toHaveTextContent(expected)
    })

    it('should format number of phones that are over a million', async () => {
      data[0].serviceEstimates[0].co2e = 309
      const { getByText, getByTestId } = render(
        <CarbonComparisonCard
          containerClass={testContainerClass}
          data={data}
        />,
      )
      act(() => {
        fireEvent.click(getByText('phones'))
      })
      const co2 = getByTestId('comparison')
      const expected = '37.6+ M'
      expect(co2).toHaveTextContent(expected)
    })

    it('should format number of phones that are over a billion', async () => {
      const { getByText, getByTestId } = render(
        <CarbonComparisonCard
          containerClass={testContainerClass}
          data={data}
        />,
      )
      act(() => {
        fireEvent.click(getByText('phones'))
      })
      const co2 = getByTestId('comparison')
      const expected = '1.2+ B'
      expect(co2).toHaveTextContent(expected)
    })

    it('should format trees', async () => {
      const { getByText, getByTestId } = render(
        <CarbonComparisonCard
          containerClass={testContainerClass}
          data={data}
        />,
      )
      act(() => {
        fireEvent.click(getByText('trees'))
      })
      const co2 = getByTestId('comparison')
      const expected = toTrees(co2kg).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })
      expect(co2).toHaveTextContent(expected)
    })
  })
})
