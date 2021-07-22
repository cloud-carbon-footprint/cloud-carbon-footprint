/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const PADDING_LOADING = 2

const useStyles = makeStyles((theme) => ({
  boxContainer: {
    padding: theme.spacing(3, 10),
    marginTop: 62,
  },
  loadingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    minHeight: '100vh',
  },
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
  gridCardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap-reverse',
  },
  loadingMessage: {
    padding: theme.spacing(PADDING_LOADING),
    fontSize: '24px',
  },
  noData: {
    height: '500px',
    fontWeight: 900,
    fontSize: '24px',
  },
}))

export default useStyles
