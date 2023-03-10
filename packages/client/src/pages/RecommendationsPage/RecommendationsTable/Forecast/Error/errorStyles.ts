/*
 * © 2023 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  container: {
    padding: '0.75em 1em',
    background: 'rgba(63, 81, 181, 0.08)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    maxWidth: 1200,
  },
  noBackground: {
    background: 'none',
    paddingBottom: 'container',
    maxWidth: '100%',
  },
  icon: {
    width: 40,
    height: 40,
    color: '#ff9800',
    paddingRight: 10,
  },
  accordionContainer: {
    boxShadow: 'none',
    borderRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: 'rgb(255, 152, 0, 0.05)',
    '&::before': {
      backgroundColor: 'white',
    },
  },
}))

export default useStyles
