/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles(({ palette }) => ({
  topContainer: {
    boxShadow: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '24px',
  },
  title: {
    margin: '0',
    fontSize: '24px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    opacity: '1',
    fontWeight: 900,
    color: palette.lightTitle,
  },
}))

export default useStyles
