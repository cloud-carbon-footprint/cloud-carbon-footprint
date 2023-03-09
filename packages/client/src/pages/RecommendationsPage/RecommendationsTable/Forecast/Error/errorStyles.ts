/*
 * © 2023 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  container: {
    padding: '0.75em',
    background: 'rgba(63, 81, 181, 0.08)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    maxWidth: 960,
  },
  icon: {
    width: 30,
    height: 30,
    color: '#ff9800',
    paddingRight: 5,
  },
}))

export default useStyles
