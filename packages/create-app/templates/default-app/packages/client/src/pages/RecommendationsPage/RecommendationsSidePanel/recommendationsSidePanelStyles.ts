/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(({ spacing, typography }) => ({
  content: {
    padding: spacing(0.25),
  },
  smallText: {
    fontSize: 14,
  },
  smallLabel: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  contentLabel: {
    fontWeight: 'bold',
  },
  subLabel: {
    fontSize: 12,
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
