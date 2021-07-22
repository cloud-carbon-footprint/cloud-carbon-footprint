/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles(({ palette }) => ({
  root: {
    width: '100%',
    height: '100%',
    overflow: 'unset',
    minHeight: '755px',
  },
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
    padding: '.2em',
  },
}))

export default useStyles
