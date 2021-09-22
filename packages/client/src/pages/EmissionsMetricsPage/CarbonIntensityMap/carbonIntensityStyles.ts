/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles(() => ({
  title: {
    margin: '0',
    fontSize: '24px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    opacity: '1',
    fontWeight: 900,
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '.2em',
  },
  topContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '24px',
  },
  map: {
    maxHeight: 700,
  },
}))

export default useStyles
