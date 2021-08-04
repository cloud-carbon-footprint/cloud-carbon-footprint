/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(({ spacing }) => ({
  pageTitle: {
    margin: '0',
    fontSize: '24px',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    opacity: '1',
    // fontWeight: 900,
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '1em',
    textAlign: 'center',
  },
  boxContainer: {
    padding: spacing(3, 10),
  },
  loadingContainer: {
    padding: spacing(3, 10),
    marginTop: 62,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
  },
}))

export default useStyles
