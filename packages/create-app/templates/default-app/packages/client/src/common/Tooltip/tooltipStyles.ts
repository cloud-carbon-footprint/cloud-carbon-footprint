/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(({ palette }) => ({
  tooltip: {
    color: palette.primaryBlue,
    fontSize: 13,
    backgroundColor: palette.common.white,
    '&:hover': {
      backgroundColor: palette.common.white,
    },
  },
  helpIcon: {
    padding: 0,
    height: 24,
    marginLeft: 10,
  },
}))

export default useStyles
