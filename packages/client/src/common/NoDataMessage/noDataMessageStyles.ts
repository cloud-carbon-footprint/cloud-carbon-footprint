/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(({ palette, spacing }) => ({
  root: {
    width: '100%',
    height: '100%',
    boxShadow: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: '24px',
    padding: spacing(1, 2),
    color: palette.lightMessage,
  },
  smallText: {
    fontSize: '17px',
  },
  addSpacing: {
    marginTop: '50px',
  },
}))

export default useStyles
