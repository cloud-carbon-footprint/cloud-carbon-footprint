/*
 * © 2021 Thoughtworks, Inc.
 */

import { createStyles, makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(({ palette, spacing, typography }) => {
  return createStyles({
    contentBold: {
      padding: spacing(2, 2, 0, 2),
      fontWeight: typography.fontWeightBold,
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
  })
})

export default useStyles
