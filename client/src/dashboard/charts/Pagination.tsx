/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { useState, useEffect, PropsWithChildren, ReactElement } from 'react'
import { ChevronLeft, ChevronRight } from '@material-ui/icons'
import { IconButton, makeStyles } from '@material-ui/core'

interface UsePaginateData<T> {
  paginatedData: T[][]
  totalPages: number
}
export const usePaginateData: <T>(data: T[], pageSize: number) => UsePaginateData<T> = (data, pageSize) => {
  const paginatedData = []
  const newEntries = [...data]
  while (newEntries.length > 0) {
    const paginatedSubData = newEntries.splice(0, pageSize)
    paginatedData.push(paginatedSubData)
  }
  return {
    paginatedData,
    totalPages: paginatedData.length,
  }
}

const useStyles = makeStyles(() => {
  return {
    paginationContainer: {
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
  }
})

interface PaginateData<T> {
  data: T[]
  pageSize: number
}

export interface PaginationProps<T> extends PaginateData<T> {
  handlePage: (page: T[]) => void
}

const Pagination: <T>(props: PropsWithChildren<PaginationProps<T>>) => ReactElement = ({
  data,
  pageSize,
  handlePage,
}) => {
  if (data.length === 0) {
    return <div aria-label="no-pagination-data" />
  }

  const { paginationContainer } = useStyles()
  const [page, setPage] = useState(0)
  const { paginatedData, totalPages } = usePaginateData<typeof data[0]>(data, pageSize)
  const visibleRows = `${page * pageSize + 1} - ${page * pageSize + paginatedData[page]?.length}`

  useEffect(() => {
    handlePage(paginatedData[0])
    setPage(0)
  }, [JSON.stringify(data)])

  const onPageChange = (newPage: number) => {
    setPage(newPage)
    handlePage(paginatedData[newPage])
    console.log('hit', newPage)
  }

  return (
    <div className={paginationContainer}>
      <span style={{ color: '#ababab', fontWeight: 700, marginRight: '8px' }}>
        {visibleRows} of {data.length}
      </span>
      <IconButton
        color="primary"
        aria-label="chevron-left"
        component="button"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft />
      </IconButton>
      <IconButton
        color="primary"
        aria-label="chevron-right"
        component="button"
        disabled={page === totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight />
      </IconButton>
    </div>
  )
}

export default Pagination
