/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(({ palette, spacing }) => ({
  root: {
    width: '100%',
    height: '90%',
    boxShadow: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: '24px',
    padding: spacing(1, 2),
    color: palette.lightMessage,
  },
  boldRoot: {
    height: '74%',
  },
  smallText: {
    fontSize: '17px',
  },
  addSpacing: {
    marginTop: '50px',
  },
  largeMessage: {
    height: 587,
    fontWeight: 900,
    fontSize: 24,
  },
  boldTitleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.primary.main,
    textAlign: 'center',
    borderRadius: '12px 12px 0 0',
    minHeight: 100,
  },
  boldTitle: {
    color: palette.primary.contrastText,
    fontWeight: 700,
    fontSize: 24,
    fontFamily: 'Helvetica, Arial, sans-serif',
    marginBottom: 0,
  },
}))

export default useStyles
