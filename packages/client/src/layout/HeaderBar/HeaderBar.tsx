/*
 * © 2021 Thoughtworks, Inc.
 */

import { AppBar, Toolbar, Typography } from '@material-ui/core'
import React, { ReactElement } from 'react'
import { NavLink } from 'react-router-dom'
import useStyles from './headerBarStyles'

const HeaderBar = (): ReactElement => {
  const classes = useStyles()

  return (
    <AppBar
      position="sticky"
      square={true}
      className={classes.appBar}
      id="app-bar-header"
    >
      <Toolbar>
        <NavLink to="/" className={classes.title}>
          <Typography component="h1" variant="h5">
            Cloud Carbon Footprint
          </Typography>
        </NavLink>
        <NavLink
          to="/recommendations"
          className={classes.navLink}
          activeClassName={classes.activeNavLink}
        >
          <Typography component="h2">RECOMMENDATIONS</Typography>
        </NavLink>
      </Toolbar>
    </AppBar>
  )
}

export default HeaderBar
