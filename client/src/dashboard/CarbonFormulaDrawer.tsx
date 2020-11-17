/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent, useState } from 'react'
import clsx from 'clsx'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { Close, Info, OpenInNew } from '@material-ui/icons'
import { Typography, Drawer, Divider, IconButton, Link } from '@material-ui/core'

const drawerWidth = 340

const useStyles = makeStyles(({ palette, transitions, spacing, typography, breakpoints, mixins }) => {
  return createStyles({
    infoButton: {
      margin: spacing(10, 'auto'),
      color: palette.type === 'dark' ? palette.text.primary : palette.primary.main,
    },
    closeButtonContainer: {
      textAlign: 'right',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: transitions.create('width', {
        easing: transitions.easing.sharp,
        duration: transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: transitions.create('width', {
        easing: transitions.easing.sharp,
        duration: transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: spacing(4) + 1,
      [breakpoints.up('sm')]: {
        width: spacing(6) + 1,
      },
    },
    toolbar: {
      padding: spacing(10, 1),
      // necessary for content to be below app bar
      ...mixins.toolbar,
    },
    hide: {
      display: 'none',
    },
    contentTitle: {
      padding: spacing(2),
      fontWeight: typography.fontWeightBold,
    },
    contentBold: {
      padding: spacing(2, 2, 0, 2),
      fontWeight: typography.fontWeightBold,
    },
    content: {
      padding: spacing(2),
      whiteSpace: 'pre-line',
      fontSize: typography.body2.fontSize,
    },
    methodology: {
      padding: spacing(2),
      display: 'flex',
      color: palette.extLink,
    },
    openIcon: {
      marginLeft: '8px',
    },
  })
})

export const CarbonFormulaDrawer: FunctionComponent = () => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  return (
    <Drawer
      anchor="right"
      variant="permanent"
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
      }}
    >
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        edge="start"
        className={clsx(classes.infoButton, {
          [classes.hide]: open,
        })}
      >
        <Info data-testid="infoIcon" />
      </IconButton>
      <div
        className={clsx(classes.toolbar, {
          [classes.hide]: !open,
        })}
      >
        <div className={classes.closeButtonContainer}>
          <IconButton onClick={handleDrawerClose}>
            <Close data-testid="closeIcon" />
          </IconButton>
        </div>
        <Typography className={classes.contentTitle} component="p">
          How do we get our carbon estimates?
        </Typography>
        <Divider />
        <Typography className={classes.content} component="p">
          Our CO2e Estimate Formula:
        </Typography>
        <Typography className={classes.content} component="p">
          (Cloud provider service usage) x (Cloud provider Power Usage Effectiveness [PUE]) x (Cloud energy conversion
          factors [Wh]) x (EPA [US] or carbonfootprint.com [Non-US] grid emissions factors [CO2e])
        </Typography>
        <Divider />
        <Typography className={classes.content} component="p">
          Currently we estimate CO2e emissions for cloud compute and storage services. Networking and memory services
          usage are not estimated yet due to their comparatively small footprint and current lack of available energy
          conversion factors.
        </Typography>
        <Link
          href="https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/METHODOLOGY.md"
          target="_blank"
          rel="noopener"
          className={classes.methodology}
        >
          Read our full methodology here <OpenInNew fontSize={'small'} className={classes.openIcon}></OpenInNew>
        </Link>
      </div>
    </Drawer>
  )
}
