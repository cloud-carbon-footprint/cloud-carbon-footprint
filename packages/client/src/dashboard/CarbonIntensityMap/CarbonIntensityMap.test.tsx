/*
 * © 2021 ThoughtWorks, Inc.
 */

import { CarbonIntensityMap } from './CarbonIntensityMap'
import { fireEvent, render, within } from '@testing-library/react'
import { create } from 'react-test-renderer'

describe('Carbon Intensity Map', () => {
  it('renders with correct configuration', () => {
    const root = create(<CarbonIntensityMap />)

    expect(root.toJSON()).toMatchSnapshot()
  })

  it('renders an svg image with the map for a cloud provider', () => {
    const { getByTestId } = render(<CarbonIntensityMap />)

    const mapImage = getByTestId('intensityMap')
    expect(mapImage).toBeInstanceOf(SVGSVGElement)
  })

  it('renders a dropdown for the cloud providers to choose from', () => {
    const { getByTestId, getByRole } = render(<CarbonIntensityMap />)

    const dropdown = getByTestId('select')
    expect(dropdown).toBeInTheDocument()

    // Clicks on Material UI's select element to display the popup that has the options to be queried
    fireEvent.mouseDown(getByRole('button'))
    const dropdownOptions = within(getByRole('listbox'))

    expect(dropdownOptions.getByText('AWS')).toBeInTheDocument()
    expect(dropdownOptions.getByText('GCP')).toBeInTheDocument()
    expect(dropdownOptions.getByText('Azure')).toBeInTheDocument()
  })
})
