/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(({ palette, spacing, typography }) => ({
  contentBold: {
    padding: spacing(2, 2, 0, 2),
    fontWeight: 'bold',
  },
  content: {
    padding: spacing(2),
    whiteSpace: 'pre-line',
    fontSize: typography.body2.fontSize,
  },
  formula: {
    fontFamily: 'monospace',
  },
  methodology: {
    padding: spacing(2),
    display: 'flex',
    color: palette.extLink,
  },
  openIcon: {
    marginLeft: '8px',
  },
}))

export default useStyles
