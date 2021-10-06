/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  card: {
    width: 600,
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
    width: 600,
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
  contentContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 75,
    width: '100%',
    alignItems: 'center',
    marginTop: 64,
  },
  treeSeedlingsIcon: {
    width: 104,
    height: 104,
    color: '#73B500',
  },
  calendarIcon: {
    width: 90,
    height: 90,
    color: '#D99200',
    marginBottom: 13,
    marginTop: 3,
  },
  contentItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 180,
  },
}))

export default useStyles
