/*
 * © 2021 Thoughtworks, Inc.
 */

import { ReactElement } from 'react'
import { Container } from '@material-ui/core'
import RecommendationsTable from './RecommendationsTable'
import { useRemoteRecommendationsService } from '../../utils/hooks'

const RecommendationsPage = (): ReactElement => {
  const { data, loading } = useRemoteRecommendationsService()

  if (loading)
    return (
      <Container>
        <div>Loading Recommendations...</div>
      </Container>
    )

  return (
    <Container>
      <div>Recommendations Page</div>
      <RecommendationsTable recommendations={data} />
    </Container>
  )
}

export default RecommendationsPage
