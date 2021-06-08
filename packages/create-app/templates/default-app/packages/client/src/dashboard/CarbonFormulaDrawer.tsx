/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { FunctionComponent, useState } from 'react'
import clsx from 'clsx'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { Close, Info, OpenInNew } from '@material-ui/icons'
import {
  Typography,
  Drawer,
  Divider,
  IconButton,
  Link,
} from '@material-ui/core'

const drawerWidth = 340

const useStyles = makeStyles(
  ({ palette, transitions, spacing, typography, breakpoints, mixins }) => {
    return createStyles({
      infoButton: {
        margin: spacing(10, 'auto'),
        color:
          palette.type === 'dark' ? palette.text.primary : palette.primary.main,
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
      formula: {
        fontFamily: 'monospace',
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
  },
)

export const CarbonFormulaDrawer: FunctionComponent = () => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const drawerStatus = open ? 'open' : 'closed'
  return (
    <Drawer
      anchor="right"
      variant="permanent"
      id={`drawer-` + drawerStatus}
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
        id="info-button"
      >
        <Info data-testid="infoIcon" />
      </IconButton>
      <div
        className={clsx(classes.toolbar, {
          [classes.hide]: !open,
        })}
      >
        <div
          className={classes.closeButtonContainer}
          id="close-button-container"
        >
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
        <Typography
          className={clsx(classes.content, classes.formula)}
          component="p"
        >
          (Cloud provider service usage) x (Cloud energy conversion factors
          [kWh]) x (Cloud provider Power Usage Effectiveness (PUE)) x (grid
          emissions factors [metric tons CO2e])
        </Typography>
        <Divider />
        <Typography className={classes.content} component="p">
          Currently we estimate CO2e emissions for cloud compute, storage and
          networking. Memory usage is not estimated yet due to their arguably
          comparatively small footprint and current lack of available energy
          conversion factors.
          <br />
          <br />
          Emissions data points marked with an * have been estimated with
          average CPU Utilization because the actual CPU Utilization is not
          available.
          <br />
          <br />
          Cloud Provider regions on map are an approximation based on public
          information given by each cloud provider. Regional grid emissions
          factor sources vary based on country.
        </Typography>
        <Link
          href="https://www.cloudcarbonfootprint.org/docs/methodology"
          target="_blank"
          rel="noopener"
          className={classes.methodology}
        >
          Read more in our full methodology here{' '}
          <OpenInNew
            fontSize={'small'}
            className={classes.openIcon}
          ></OpenInNew>
        </Link>
      </div>
    </Drawer>
  )
}
