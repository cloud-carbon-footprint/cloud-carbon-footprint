/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, useEffect, useState } from 'react'
import clsx from 'clsx'
import { Close, Info } from '@material-ui/icons'
import { Typography, Drawer, Divider, IconButton } from '@material-ui/core'
import { SidePanelProps } from 'Types'
import useStyles from './sidePanelStyles'

const SidePanel: FunctionComponent<SidePanelProps> = (props) => {
  const classes = useStyles(props)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (props.defaultIsOpen) {
      handleDrawerOpen()
    }
  }, [])

  useEffect(() => {
    if (props.triggerOpenOnChange && !open) {
      setOpen(true)
    }
  }, [props.children])

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
          component="h3"
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

export default SidePanel
