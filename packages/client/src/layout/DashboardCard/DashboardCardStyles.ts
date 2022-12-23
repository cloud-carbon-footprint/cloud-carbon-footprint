/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  card: {
    width: '100%',
    height: '100%',
    boxShadow: '0px 16px 30px 0px rgba(151, 151, 151, .25)',
    borderRadius: 12,
  },
  cardHalf: {
    width: '50%',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  minHeight: {
    minHeight: '765px',
    overflow: 'unset',
  },
  title: {
    margin: '0',
    fontSize: '24px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    opacity: '1',
    fontWeight: 900,
    color: 'rgba(0, 0, 0, 0.87)',
    paddingLeft: 0,
  },
  contentContainer: {
    height: '100%',
  },
  cardContent: {
    height: '100%',
    width: '100%',
    boxShadow: 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 !important',
  },
}))

export default useStyles
