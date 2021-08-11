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
    '&.MuiDataGrid-root .MuiDataGrid-row.Mui-selected:hover': {
      backgroundColor: 'red !important',
      border: 'solid 2px #3F51B5',
      borderRadius: '7px',
    },
  },
}))

export default useStyles
