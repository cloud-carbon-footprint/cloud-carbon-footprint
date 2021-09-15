/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  tooltip: {
    color: theme.palette.primaryBlue,
    fontSize: 13,
    backgroundColor: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.common.white,
    },
  },
  helpIcon: {
    padding: 0,
    height: 24,
    marginLeft: 10,
  },
}))

export default useStyles
