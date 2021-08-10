/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'
import { SidePanelProps } from 'Types'

const useStyles = makeStyles(
  ({ palette, transitions, spacing, typography, breakpoints, mixins }) => ({
    infoButton: {
      margin: spacing(10, 'auto'),
      color:
        palette.type === 'dark' ? palette.text.primary : palette.primary.main,
    },
    closeButtonContainer: {
      textAlign: 'right',
    },
    drawer: {
      width: ({ drawerWidth }: SidePanelProps) => drawerWidth,
      flexShrink: 0,
    },
    drawerOpen: {
      width: ({ drawerWidth }: SidePanelProps) => drawerWidth,
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
      textAlign: 'center',
      fontWeight: typography.fontWeightBold,
      fontSize: 18,
    },
  }),
)

export default useStyles
