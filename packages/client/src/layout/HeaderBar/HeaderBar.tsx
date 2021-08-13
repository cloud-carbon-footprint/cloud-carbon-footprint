/*
 * © 2021 Thoughtworks, Inc.
 */

import { AppBar, Toolbar, Typography } from '@material-ui/core'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import React, { ReactElement } from 'react'
import { NavLink } from 'react-router-dom'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      flexGrow: 1,
    },
    navLink: {
      fontSize: theme.typography.fontSize,
      marginTop: '6px',
      borderBottom: 'solid 2px transparent',
      '&:hover': {
        borderColor: 'white',
      },
    },
    activeNavLink: {
      borderBottom: 'solid 2px white',
    },
    title: {
      color: 'inherit',
      textDecoration: 'inherit',
      flexGrow: 0.8,
    },
  }),
)

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
          activeClassName={classes.activeNavLink}
          className={classes.navLink}
          style={{ color: 'inherit', textDecoration: 'inherit' }}
        >
          <Typography component="h2">RECOMMENDATIONS</Typography>
        </NavLink>
      </Toolbar>
    </AppBar>
  )
}

export default HeaderBar
