/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, {
  useState,
  useEffect,
  PropsWithChildren,
  ReactElement,
} from 'react'
import {
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
} from '@material-ui/icons'
import { IconButton, makeStyles } from '@material-ui/core'

interface UsePaginateData<T> {
  paginatedData: T[][]
  totalPages: number
}
export const usePaginateData: <T>(
  data: T[],
  pageSize: number,
) => UsePaginateData<T> = (data, pageSize) => {
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

export interface Page<T> {
  data: T[]
  page: number
}

export interface PaginationProps<T> extends PaginateData<T> {
  handlePage: (page: Page<T>) => void
}

export const Pagination: <T>(
  props: PropsWithChildren<PaginationProps<T>>,
) => ReactElement = ({ data, pageSize, handlePage }) => {
  const { paginationContainer } = useStyles()
  const [page, setPage] = useState(0)
  const { paginatedData, totalPages } = usePaginateData<typeof data[0]>(
    data,
    pageSize,
  )
  const visibleRows = `${page * pageSize + 1} - ${
    page * pageSize + paginatedData[page]?.length
  }`

  useEffect(() => {
    handlePage({ data: paginatedData[0] || [], page: 0 })
    setPage(0)
  }, [JSON.stringify(data)])

  const onPageChange = (newPage: number) => {
    setPage(newPage)
    handlePage({ data: paginatedData[newPage], page: newPage })
  }

  const lastPage = paginatedData.length - 1
  return data.length === 0 ? (
    <div aria-label="no-pagination-data" />
  ) : (
    <div className={paginationContainer}>
      <span style={{ color: '#ababab', fontWeight: 700, marginRight: '8px' }}>
        {visibleRows} of {data.length}
      </span>
      <IconButton
        color="primary"
        aria-label="first page"
        component="button"
        disabled={page === 0}
        onClick={() => onPageChange(0)}
      >
        <FirstPage />
      </IconButton>
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
      <IconButton
        color="primary"
        aria-label="last page"
        component="button"
        disabled={page === lastPage}
        onClick={() => onPageChange(lastPage)}
      >
        <LastPage />
      </IconButton>
    </div>
  )
}
