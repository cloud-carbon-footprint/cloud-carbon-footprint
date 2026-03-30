/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  useGridApiContext,
  useGridSelector,
  gridPageCountSelector,
  gridPaginationModelSelector,
  GridToolbarContainer,
} from '@mui/x-data-grid'
import { Pagination, Box, MenuItem, Select, Typography } from '@mui/material'
import { FunctionComponent, ReactElement } from 'react'
import useStyles from './recommendationsTableStyles'

type CustomPaginationProps = {
  handlePageSizeChange: (number) => void
}

const CustomPagination: FunctionComponent<CustomPaginationProps> = ({
  handlePageSizeChange,
}): ReactElement => {
  const apiRef = useGridApiContext()
  const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector)
  const pageCount = useGridSelector(apiRef, gridPageCountSelector)
  const { classes } = useStyles()

  return (
    <GridToolbarContainer>
      <Box display="flex" flexGrow={1} />
      <Typography className={classes.rowsPerPage}>Rows per page:</Typography>
      <Select
        value={paginationModel.pageSize}
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
        count={pageCount}
        page={paginationModel.page + 1}
        showFirstButton
        showLastButton
        onChange={(event, value) => apiRef.current.setPage(value - 1)}
      />
    </GridToolbarContainer>
  )
}

export default CustomPagination
