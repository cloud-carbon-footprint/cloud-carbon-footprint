/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  useGridSlotComponentProps,
  GridToolbarContainer,
} from '@material-ui/data-grid'
import Pagination from '@material-ui/lab/Pagination'
import { Box, MenuItem, Select, Typography } from '@material-ui/core'
import { FunctionComponent, ReactElement } from 'react'
import useStyles from './recommendationsTableStyles'

type CustomPaginationProps = {
  handlePageSizeChange: (number) => void
}

const CustomPagination: FunctionComponent<CustomPaginationProps> = ({
  handlePageSizeChange,
}): ReactElement => {
  const { state, apiRef } = useGridSlotComponentProps()
  const classes = useStyles()

  return (
    <GridToolbarContainer>
      <Box display="flex" flexGrow={1} />
      <Typography className={classes.rowsPerPage}>Rows per page:</Typography>
      <Select
        value={state.pagination.pageSize}
        onChange={(event) => handlePageSizeChange(event.target.value)}
      >
        <MenuItem value={25}>25</MenuItem>
        <MenuItem value={50}>50</MenuItem>
        <MenuItem value={100}>100</MenuItem>
      </Select>
      <Pagination
        className={classes.cell}
        color="primary"
        size="small"
        shape="rounded"
        count={state.pagination.pageCount}
        page={state.pagination.page + 1}
        showFirstButton
        showLastButton
        onChange={(event, value) => apiRef.current.setPage(value - 1)}
      />
    </GridToolbarContainer>
  )
}

export default CustomPagination
