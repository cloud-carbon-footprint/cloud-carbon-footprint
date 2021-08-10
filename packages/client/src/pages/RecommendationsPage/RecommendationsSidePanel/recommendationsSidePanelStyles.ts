/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(({ spacing, typography }) => ({
  content: {
    padding: spacing(2),
    whiteSpace: 'pre-line',
    fontSize: typography.body2.fontSize,
  },
  contentLabel: {
    fontWeight: typography.fontWeightBold,
  },
  detailsContainer: {
    textAlign: 'center',
    padding: spacing(2),
    fontSize: typography.body2.fontSize,
  },
  detailsColumn: {
    paddingBottom: spacing(2),
  },
  savingsContainer: {
    padding: spacing(2),
  },
}))

export default useStyles
