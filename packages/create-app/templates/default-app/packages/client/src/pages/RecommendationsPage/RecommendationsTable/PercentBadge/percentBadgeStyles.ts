/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const lightPositive = '#e0fbcd'
const darkPositive = '#00791E'
const lightNegative = '#ffedf0'
const darkNegative = '#c22000'

const useStyles = makeStyles(() => ({
  badgeContainer: {
    display: 'flex',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    backgroundColor: lightPositive,
    color: darkPositive,
    fontWeight: 'bold',
    height: 30,
    marginTop: 5,
    borderRadius: 3,
    '& p': {
      fontWeight: 'bold',
    },
  },
  increasingBadge: {
    backgroundColor: lightNegative,
    color: darkNegative,
  },
  noChangeBadge: {
    backgroundColor: '#EDEDED',
    color: 'black',
  },
}))

export default useStyles
