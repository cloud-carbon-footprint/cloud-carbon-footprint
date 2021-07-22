/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(({ palette, spacing, typography }) => {
  return {
    root: {
      width: '100%',
      height: '100%',
      minHeight: '755px',
    },
    title: {
      color: palette.primary.contrastText,
    },
    posOne: {
      color: palette.primary.contrastText,
    },
    posTwo: {
      maxWidth: 250,
    },
    topContainer: {
      backgroundColor: palette.primary.main,
      textAlign: 'center',
    },
    bottomContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '55%',
      paddingTop: '10%',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    metricOne: {
      color: palette.primary.contrastText,
      fontWeight: typography.fontWeightBold,
    },
    metricTwo: {
      color: palette.primary.light,
      fontWeight: typography.fontWeightBold,
    },
    icon: {
      height: 240,
      width: 200,
      color: palette.primary.light,
    },
    source: {
      padding: spacing(2),
      display: 'flex',
      justifyContent: 'center',
    },
    sourceLink: {
      padding: spacing(0, 1),
      display: 'inline-flex',
      alignItems: 'center',
      color: palette.extLink,
    },
    openIcon: {
      marginLeft: '8px',
    },
    noData: {
      marginTop: '75px',
    },
  }
})

export default useStyles
