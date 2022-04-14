/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  card: {
    backgroundColor: '#EC6559',
    flex: '1 1 200px',
    maxWidth: 300,
    height: 350,
    border: '5px solid #EC6559',
    borderRadius: 15,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    backgroundColor: '#EC6559',
    height: 64,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  title: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
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
    backgroundColor: '#F7BDB8',
    width: '75%',
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
    gap: 30,
  },
  contentWithBadge: {
    gap: 25,
  },
  numberContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}))

export default useStyles
