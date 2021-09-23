/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  card: {
    width: 300,
    height: 350,
    border: '5px solid #3F51B5',
    borderRadius: 15,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  titleContainer: {
    backgroundColor: '#3F51B5',
    width: 300,
    position: 'absolute',
    top: 0,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 24,
    lineHeight: 2,
    color: '#FFFFFF',
  },
  textContent: {
    fontSize: 50,
    textAlign: 'center',
  },
  co2eSavings: {
    lineHeight: 1.1,
  },
  costSavings: {
    lineHeight: 1,
  },
  unitsText: {
    textAlign: 'center',
    fontSize: 16,
  },
  divider: {
    backgroundColor: '#3F51B5',
    width: 212,
    height: 4,
    margin: 'auto',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
    alignSelf: 'center',
    marginTop: 50,
  },
}))

export default useStyles
