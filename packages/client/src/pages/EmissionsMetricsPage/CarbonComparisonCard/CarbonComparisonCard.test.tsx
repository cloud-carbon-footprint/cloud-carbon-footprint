/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { mockData } from 'utils/data'
import CarbonComparisonCard from './CarbonComparisonCard'

describe('CarbonComparisonCard', () => {
  it('updates the selected carbon comparison option correctly', async () => {
    const { getByText, getByTestId } = render(
      <CarbonComparisonCard data={mockData} />,
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
      <CarbonComparisonCard data={mockData} />,
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
    const { getByText } = render(<CarbonComparisonCard data={mockData} />)
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
    const { getByText } = render(<CarbonComparisonCard data={mockData} />)
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

  it('should show a no data message if there if there is no data to compare', () => {
    const { getByText } = render(<CarbonComparisonCard data={[]} />)

    expect(getByText("There's no data to display!")).toBeInTheDocument()
  })

  describe('Number formatting', () => {
    // Makes a copy of the default test data with a specified co2e value
    const dataWithCo2e = (testCo2e: number): EstimationResult[] => [
      {
        ...mockData[0],
        serviceEstimates: [
          { ...mockData[0].serviceEstimates[0], co2e: testCo2e },
        ],
      },
    ]

    it('should format co2e to default locale integer with large number', async () => {
      const testData = dataWithCo2e(999999.55555555555)
      const { getByTestId } = render(<CarbonComparisonCard data={testData} />)
      const co2 = getByTestId('co2')
      expect(co2).toHaveTextContent('999,999.6')
    })

    it('should format co2e to default locale integer with small number', async () => {
      const testData = dataWithCo2e(0.00012345)
      const { getByTestId } = render(<CarbonComparisonCard data={testData} />)
      const co2 = getByTestId('co2')
      expect(co2).toHaveTextContent('0.00012')
    })

    it('should convert and format to flights', async () => {
      const testData = dataWithCo2e(10000)
      const { getByTestId } = render(<CarbonComparisonCard data={testData} />)
      const co2 = getByTestId('comparison')
      expect(co2).toHaveTextContent('12,346')
    })

    it('should convert  and format to number of phones that are less than a million', async () => {
      const testData = dataWithCo2e(8)
      const { getByText, getByTestId } = render(
        <CarbonComparisonCard data={testData} />,
      )
      act(() => {
        fireEvent.click(getByText('phones'))
      })
      const co2 = getByTestId('comparison')
      expect(co2).toHaveTextContent('973,144')
    })

    it('should convert and format to number of phones that are over a million', async () => {
      const testData = dataWithCo2e(309)
      const { getByText, getByTestId } = render(
        <CarbonComparisonCard data={testData} />,
      )
      act(() => {
        fireEvent.click(getByText('phones'))
      })
      const co2 = getByTestId('comparison')
      expect(co2).toHaveTextContent('37.6+ M')
    })

    it('should convert and format to number of phones that are over a billion', async () => {
      const testData = dataWithCo2e(10000)
      const { getByText, getByTestId } = render(
        <CarbonComparisonCard data={testData} />,
      )
      act(() => {
        fireEvent.click(getByText('phones'))
      })
      const co2 = getByTestId('comparison')
      expect(co2).toHaveTextContent('1.2+ B')
    })

    it('should convert and format to trees', async () => {
      const testData = dataWithCo2e(10000)
      const { getByText, getByTestId } = render(
        <CarbonComparisonCard data={testData} />,
      )
      act(() => {
        fireEvent.click(getByText('trees'))
      })
      const co2 = getByTestId('comparison')
      expect(co2).toHaveTextContent('165,338')
    })
  })
})
