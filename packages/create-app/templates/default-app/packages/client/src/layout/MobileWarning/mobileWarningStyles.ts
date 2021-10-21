/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(({ palette }) => ({
  container: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    margin: '0',
    fontSize: '24px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    opacity: '1',
    fontWeight: 900,
    color: 'rgba(0, 0, 0, 0.87)',
    paddingLeft: 0,
  },
  card: {
    height: 350,
    textAlign: 'center',
  },
  contentContainer: {
    padding: 15,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  icon: {
    width: 120,
    height: 120,
    color: palette.primary.main,
  },
  closeButtonContainer: {
    textAlign: 'right',
  },
}))

export default useStyles
