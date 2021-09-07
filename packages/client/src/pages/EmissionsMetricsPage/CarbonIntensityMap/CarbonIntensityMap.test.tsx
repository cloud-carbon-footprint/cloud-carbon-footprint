/*
 * © 2021 Thoughtworks, Inc.
 */

import CarbonIntensityMap from './CarbonIntensityMap'
import { fireEvent, render, within } from '@testing-library/react'
import { create } from 'react-test-renderer'

describe('Carbon Intensity Map', () => {
  it('should render with correct configuration', () => {
    const root = create(<CarbonIntensityMap />)

    expect(root.toJSON()).toMatchSnapshot()
  })

  it('should show a png image with the AWS map as default', () => {
    const { getByTestId } = render(<CarbonIntensityMap />)

    const mapImage = getByTestId('awsIntensityMap')
    expect(mapImage).toBeInstanceOf(HTMLImageElement)
  })

  it('should show a dropdown for the cloud providers to choose from', () => {
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

  it('should show a map for GCP when selecting GCP from the dropdown', () => {
    const { getByTestId, getByRole } = render(<CarbonIntensityMap />)

    fireEvent.mouseDown(getByRole('button'))
    const dropdownOptions = within(getByRole('listbox'))
    fireEvent.click(dropdownOptions.getByText('GCP'))

    expect(getByTestId('gcpIntensityMap')).toBeInTheDocument()
  })

  it('should show a map for Azure when selecting Azure from the dropdown', () => {
    const { getByTestId, getByRole } = render(<CarbonIntensityMap />)

    fireEvent.mouseDown(getByRole('button'))
    const dropdownOptions = within(getByRole('listbox'))
    fireEvent.click(dropdownOptions.getByText('Azure'))

    expect(getByTestId('azureIntensityMap')).toBeInTheDocument()
  })
})
