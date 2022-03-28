/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const PADDING_LOADING = 2

const useStyles = makeStyles((theme) => ({
  loadingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    height: 'calc(100vh - 65px)',
  },
  loadingMessage: {
    padding: theme.spacing(PADDING_LOADING),
    fontSize: '24px',
  },
}))

export default useStyles
