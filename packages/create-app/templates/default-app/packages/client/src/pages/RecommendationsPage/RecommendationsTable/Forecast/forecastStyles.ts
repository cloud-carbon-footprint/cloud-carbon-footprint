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
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  icon: {
    width: 100,
    height: 100,
    color: '#EDEDED',
  },
  equalSign: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 155,
  },
}))

export default useStyles
