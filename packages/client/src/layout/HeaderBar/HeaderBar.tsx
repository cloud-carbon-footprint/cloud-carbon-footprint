/*
 * © 2021 Thoughtworks, Inc.
 */

import { AppBar, Toolbar, Typography } from '@material-ui/core'
import React, { ReactElement } from 'react'
import { NavLink } from 'react-router-dom'
import useStyles from './headerBarStyles'
import logo from './ccf_logo.png'

const HeaderBar = (): ReactElement => {
  const classes = useStyles()

  return (
    <AppBar
      position="sticky"
      square={true}
      className={classes.appBar}
      id="app-bar-header"
    >
      <Toolbar className={classes.navContainer}>
        <NavLink to="/" className={classes.title}>
          <img
            src={logo}
            alt={'Cloud Carbon Footprint Logo'}
            className={classes.logo}
          />
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
