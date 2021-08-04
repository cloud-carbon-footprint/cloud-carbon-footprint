/*
 * © 2021 Thoughtworks, Inc.
 */

import { ReactElement } from 'react'
import { Grid } from '@material-ui/core'
import { useRemoteRecommendationsService } from 'utils/hooks'
import RecommendationsTable from './RecommendationsTable'
import useStyles from './recommendationsPageStyles'

const RecommendationsPage = (): ReactElement => {
  const classes = useStyles()
  const { data, loading } = useRemoteRecommendationsService()

  if (loading)
    return (
      <Grid container className={classes.loadingContainer}>
        <div>Loading Recommendations...</div>
      </Grid>
    )

  return (
    <div className={classes.boxContainer}>
      <Grid container spacing={3}>
        <RecommendationsTable recommendations={data} />
      </Grid>
    </div>
  )
}

export default RecommendationsPage
