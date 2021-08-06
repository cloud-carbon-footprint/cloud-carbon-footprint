/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactNode, useState } from 'react'
import clsx from 'clsx'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { Close, Info } from '@material-ui/icons'
import { Typography, Drawer, Divider, IconButton } from '@material-ui/core'

const drawerWidth = 340

interface InfoSideBarProps {
  drawerWidth: number
  title: string
  children: ReactNode
}

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
        width: 0, //spacing(4) + 1,
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
    })
  },
)

const InfoSidebar: FunctionComponent<InfoSideBarProps> = (props) => {
  const classes = useStyles(props.drawerWidth)
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
        <Typography
          className={classes.contentTitle}
          component="p"
          data-testid="sideBarTitle"
        >
          {props.title}
        </Typography>
        <Divider />
        {props.children}
      </div>
    </Drawer>
  )
}

export default InfoSidebar
