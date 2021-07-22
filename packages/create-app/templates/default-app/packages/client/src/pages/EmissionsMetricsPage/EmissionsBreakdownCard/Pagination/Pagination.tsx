/*
 * © 2021 Thoughtworks, Inc.
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
import { IconButton } from '@material-ui/core'
import { Page } from 'Types'
import useStyles from './paginationStyles'

interface UsePaginateData<T> {
  paginatedData: T[][]
  totalPages: number
}

interface PaginateData<T> {
  data: T[]
  pageSize: number
}

interface PaginationProps<T> extends PaginateData<T> {
  handlePage: (page: Page<T>) => void
}

const usePaginateData: <T>(data: T[], pageSize: number) => UsePaginateData<T> =
  (data, pageSize) => {
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

const Pagination: <T>(
  props: PropsWithChildren<PaginationProps<T>>,
) => ReactElement = ({ data, pageSize, handlePage }) => {
  const { paginationContainer, paginationLabel } = useStyles()
  const [page, setPage] = useState(0)
  const { paginatedData, totalPages } = usePaginateData<typeof data[0]>(
    data,
    pageSize,
  )
  const lastPage = paginatedData.length - 1
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

  if (data.length === 0) {
    return <div aria-label="no-pagination-data" />
  }

  return (
    <div className={paginationContainer}>
      <span className={paginationLabel}>
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

export default Pagination
