/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(({ spacing }) => ({
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
