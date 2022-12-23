/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  title: {
    margin: '0',
    fontSize: '24px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    opacity: '1',
    fontWeight: 900,
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '.2em',
    paddingLeft: 0,
    marginBottom: 25,
  },
  forecastContainer: {
    display: 'flex',
    flex: '0 1 auto',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  icon: {
    width: 75,
    height: 75,
    color: '#EDEDED',
  },
  equalSign: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 120,
  },
}))

export default useStyles
