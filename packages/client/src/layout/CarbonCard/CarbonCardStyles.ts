/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  gridCardHalf: {
    width: '50%',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  gridCardFull: {
    width: '100%',
    height: '100%',
  },
  title: {
    margin: '0',
    fontSize: '24px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    opacity: '1',
    fontWeight: 900,
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '.2em',
    paddingLeft: 0,
  },
  cardContent: {
    boxShadow: 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 0,
  },
}))

export default useStyles
