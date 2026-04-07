/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from 'tss-react/mui'
import { SidePanelProps } from '../../Types'

const useStyles = makeStyles<Pick<SidePanelProps, 'drawerWidth'>>()(
  ({ palette, transitions, spacing, breakpoints, mixins }, { drawerWidth }) => ({
    infoButton: {
      margin: spacing(10, 'auto'),
      color:
        palette.mode === 'dark' ? palette.text.primary : palette.primary.main,
    },
    closeButtonContainer: {
      textAlign: 'right',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
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
      width: 0,
      [breakpoints.up('sm')]: {
        width: `calc(${spacing(6)} + 1px)`,
      },
      marginRight: 14,
    },
    toolbar: {
      padding: spacing(10, 1),
      ...(mixins.toolbar as Record<string, unknown>),
    },
    hide: {
      display: 'none',
    },
    contentTitle: {
      padding: spacing(2),
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 18,
    },
  }),
)

export default useStyles
