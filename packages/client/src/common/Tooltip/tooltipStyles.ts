/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'
import { Tooltip as MaterialTooltip, withStyles } from '@material-ui/core'
import { CCFTheme } from '../../utils/themes'

const useStyles = makeStyles<CCFTheme>(({ palette }) => ({
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

export const TextOnlyTooltip = withStyles({
  tooltip: {
    color: 'rgba(0, 0, 0, 0.87)',
    backgroundColor: 'white',
    border: 'solid 1px #E6E6E6',
    fontSize: 13,
    fontWeight: 'normal',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    boxShadow: '1px 1px 5px #E6E6E6',
    borderRadius: '5px',
  },
  arrow: {
    color: '#E6E6E6',
  },
})(MaterialTooltip)

export default useStyles
