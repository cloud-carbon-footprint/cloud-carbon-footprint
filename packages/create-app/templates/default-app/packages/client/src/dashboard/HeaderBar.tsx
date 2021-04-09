/*
 * © 2021 ThoughtWorks, Inc.
 */

import { AppBar, Toolbar, Typography } from '@material-ui/core'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import React, { ReactElement } from 'react'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
  }),
)

const HeaderBar = (): ReactElement => {
  const classes = useStyles()

  return (
    <AppBar position="sticky" square={true} className={classes.appBar}>
      <Toolbar>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'inherit' }}>
          <Typography component="h1" variant="h5">
            Cloud Carbon Footprint
          </Typography>
        </Link>
      </Toolbar>
    </AppBar>
  )
}

export default HeaderBar
