/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  cell: {
    outline: 'none !important',
  },
  //TODO: make this work
  row: {
    cursor: 'pointer',
    '&:hover': {
      border: 'solid 2px #3F51B5',
      borderRadius: '7px',
    },
  },
  tableContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  toolbarContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRangeContainer: {
    display: 'flex',
  },
  title: {
    margin: '0',
    fontSize: '24px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    opacity: '1',
    fontWeight: 900,
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '.2em',
    paddingLeft: 0,
  },
  recommendationsContainer: {
    marginTop: 65,
  },
}))

export default useStyles
