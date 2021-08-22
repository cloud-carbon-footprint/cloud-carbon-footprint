/*
 * © 2021 Thoughtworks, Inc.
 */

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      flexGrow: 1,
    },
    logo: {
      height: 32,
    },
    navContainer: {
      justifyContent: 'space-between',
    },
    title: {
      display: 'flex',
      gap: 15,
      color: 'inherit',
      textDecoration: 'inherit',
    },
    navLink: {
      fontSize: theme.typography.fontSize,
      marginRight: theme.spacing(5),
      position: 'relative',
      overflow: 'hidden',
      color: 'inherit',
      textDecoration: 'inherit',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '0.15em',
        backgroundColor: 'white',
        opacity: 1,
        transition: 'opacity 300ms, transform 300ms',
        transform: 'translate3d(-110%, 0, 0)',
      },
      // Animations for underline on hover
      '&:hover::after': {
        transform: 'translate3d(0, 0, 0)',
      },
      '&:focus::after': {
        transform: 'translate3d(0, 0, 0)',
      },
    },
    activeNavLink: {
      '&::after': {
        transform: 'translate3d(0, 0, 0)',
      },
    },
  }),
)

export default useStyles
