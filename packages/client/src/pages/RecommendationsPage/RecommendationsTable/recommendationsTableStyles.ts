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
    textAlign: 'center',
    '&.MuiDataGrid-root .MuiDataGrid-row.Mui-selected:hover': {
      backgroundColor: 'red !important',
      border: 'solid 2px #3F51B5',
      borderRadius: '7px',
    },
  },
  tableContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  toggleContainer: {
    alignSelf: 'flex-end',
  },
}))

export default useStyles
