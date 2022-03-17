/*
 * © 2021 Thoughtworks, Inc.
 */

import { AppBar, Toolbar, Typography } from '@material-ui/core'
import React, { ReactElement } from 'react'
import { NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import useStyles from './headerBarStyles'
import logo from './osp_ccf_logo.png'

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
            OSP Cloud Carbon Footprint
          </Typography>
        </NavLink>
        <Link
          to="#"
          onClick={(e) => {
            window.open('mailto:ccf@osp.de')
            e.preventDefault()
          }}
        >
          <Typography component="h2">CONTACT</Typography>
        </Link>
        <NavLink
          to="/recommendations"
          className={clsx(classes.navLink, { isActive: classes.activeNavLink })}
        >
          <Typography component="h2">RECOMMENDATIONS</Typography>
        </NavLink>
      </Toolbar>
    </AppBar>
  )
}

export default HeaderBar
