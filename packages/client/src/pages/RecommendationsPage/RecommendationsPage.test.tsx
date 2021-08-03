/*
 * © 2021 Thoughtworks, Inc.
 */

import { render } from '@testing-library/react'
import RecommendationsPage from './RecommendationsPage'

describe('Recommendations Page', () => {
  it('renders the title', () => {
    const { getByText } = render(<RecommendationsPage />)

    expect(getByText('Recommendations Page')).toBeInTheDocument()
  })

  it('renders a table with recommendations', () => {
    const { getByRole } = render(<RecommendationsPage />)

    expect(getByRole('grid')).toBeInTheDocument()
  })
})
