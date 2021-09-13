/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import { Box, Card, CardContent, Grid, Typography } from '@material-ui/core'
import useStyles from './CarbonCardStyles'

type CarbonCardProps = {
  title?: string
  children: ReactElement
}

const CarbonCard: FunctionComponent<CarbonCardProps> = ({
  title,
  children,
}) => {
  const classes = useStyles()

  return (
    <Grid item xs={12}>
      <Card className={classes.gridCardFull}>
        <Box padding={3}>
          <Typography className={classes.title}>{title}</Typography>
          <CardContent className={classes.cardContent}>{children}</CardContent>
        </Box>
      </Card>
    </Grid>
  )
}

export default CarbonCard
