/*
 * © 2021 Thoughtworks, Inc.
 */

import { ReactElement } from 'react'
import { Container } from '@material-ui/core'
import RecommendationsTable from './RecommendationsTable'

const RecommendationsPage = (): ReactElement => (
  <Container>
    <div>Recommendations Page</div>
    <RecommendationsTable recommendations={[]} />
  </Container>
)

export default RecommendationsPage
