/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  card: {
    backgroundColor: '#3F51B5',
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
    fontSize: 36,
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
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    padding: 30,
    gap: 30,
    marginTop: 50,
  },
  contentWithBadge: {
    gap: 25,
    marginTop: 60,
  },
  numberContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loadingNumber: {
    animation: '$blinker 2s linear infinite',
  },
  '@keyframes blinker': {
    '50%': { opacity: 0 },
  },
}))

export default useStyles
