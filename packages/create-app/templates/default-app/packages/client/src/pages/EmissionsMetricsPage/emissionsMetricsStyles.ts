/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const PADDING_LOADING = 2

const useStyles = makeStyles((theme) => ({
  boxContainer: {
    padding: theme.spacing(3, 10),
  },
  loadingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    minHeight: '100vh',
  },
  gridCardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap-reverse',
  },
  loadingMessage: {
    padding: theme.spacing(PADDING_LOADING),
    fontSize: '24px',
  },
  pageContainer: {
    height: '100%',
    overflowY: 'scroll',
  },
}))

export default useStyles
