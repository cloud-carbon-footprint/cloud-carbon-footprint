/*
 * © 2021 Thoughtworks, Inc.
 */

import React, {
  FunctionComponent,
  ReactElement,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react'
import {
  DataGrid,
  GridColDef,
  GridOverlay,
  GridRowParams,
  MuiEvent,
} from '@material-ui/data-grid'
import {
  RecommendationResult,
  ServiceData,
} from '@cloud-carbon-footprint/common'
import { Typography } from '@material-ui/core'
import DashboardCard from 'layout/DashboardCard'
import useStyles from './recommendationsTableStyles'
import DateRange from 'common/DateRange'
import Tooltip from 'common/Tooltip'
import SearchBar from '../SearchBar'
import Forecast from './Forecast/Forecast'
import CustomPagination from './CustomPagination'

type RecommendationsTableProps = {
  emissionsData: ServiceData[]
  recommendations: RecommendationResult[]
  handleRowClick: (
    params: GridRowParams,
    event: MuiEvent<SyntheticEvent>,
  ) => void
  useKilograms: boolean
}

const getColumns = (
  useKilograms: boolean,
  recommendations: RecommendationResult[],
): GridColDef[] => [
  {
    field: 'cloudProvider',
    headerName: 'Cloud Provider',
    width: 175,
  },
  {
    field: 'accountName',
    headerName: 'Account Name',
    flex: 0.75,
  },
  {
    field: 'region',
    headerName: 'Region',
    flex: 0.5,
  },
  {
    field: 'recommendationType',
    headerName: 'Recommendation Type',
    flex: 0.75,
  },
  {
    field: 'costSavings',
    headerName: 'Potential Cost Savings ($)',
    flex: 0.75,
  },
  {
    field: 'co2eSavings',
    headerName: useKilograms
      ? 'Potential Carbon Savings (kg)'
      : 'Potential Carbon Savings (t)',
    sortComparator: (v1, v2, param1, param2) => {
      const rowParam1 = param1.api.getRowParams(param1.id)
      const rowParam2 = param2.api.getRowParams(param2.id)

      const recommendation1: RecommendationResult = recommendations.find(
        (element) => element.accountName == rowParam1.row.accountName,
      )
      const recommendation2: RecommendationResult = recommendations.find(
        (element) => element.accountName == rowParam2.row.accountName,
      )

      return recommendation1.co2eSavings - recommendation2.co2eSavings
    },
    flex: 0.75,
  },
]

const RecommendationsTable: FunctionComponent<RecommendationsTableProps> = ({
  emissionsData,
  recommendations,
  handleRowClick,
  useKilograms,
}): ReactElement => {
  const [searchBarValue, setSearchBarValue] = useState('')
  const [rows, setRows] = useState([])
  const initialPageState = {
    page: 0,
    pageSize: 25,
    sortOrder: null,
  }
  const [pageState, setPageState] = useState(initialPageState)

  const classes = useStyles()

  const handlePageSizeChange = (newPageSize: number) => {
    setPageState({ ...pageState, pageSize: newPageSize })
  }

  const createRecommendationRows = (
    recommendations: RecommendationResult[],
  ) => {
    if (recommendations) {
      const recommendationRows = recommendations.map(
        (recommendation, index) => {
          const recommendationRow = {
            ...recommendation,
            id: index,
            useKilograms,
            co2eSavings: useKilograms
              ? recommendation.co2eSavings * 1000
              : recommendation.co2eSavings,
          }
          // Replace any undefined values and round numbers to thousandth decimal
          Object.keys(recommendation).forEach((key) => {
            recommendationRow[key] = recommendationRow[key] ?? '-'
            if (key.includes('Savings') && recommendationRow[key] != '-') {
              const roundedRecommendation =
                Math.round(recommendationRow[key] * 1000) / 1000
              recommendationRow[key] =
                roundedRecommendation >= 0.001
                  ? roundedRecommendation
                  : '< 0.001'
            }
          })
          return recommendationRow
        },
      )
      setRows(recommendationRows)
    }
  }

  const resetToInitialPage = (initialPage = 0) => {
    setPageState({ ...pageState, page: initialPage })
  }

  const handleSearchBarChange = (value: string) => {
    setSearchBarValue(value)
    requestSearch(value)
    resetToInitialPage()
  }

  const requestSearch = (searchValue: string) => {
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')
    const fieldsToNotFilter = [
      'resourceId',
      'kilowattHourSavings',
      'instanceName',
      'accountId',
      'recommendationDetail',
    ]
    const filteredRecommendations = recommendations.filter(
      (row: RecommendationResult) => {
        return Object.keys(row).some((field: string) => {
          if (!fieldsToNotFilter.includes(field)) {
            let value = row[field]
            if (field.includes('Savings')) {
              value = Math.round(value * 1000) / 1000
            }
            return searchRegex.test(value?.toString())
          }
        })
      },
    )
    createRecommendationRows(filteredRecommendations)
  }

  useEffect(() => {
    requestSearch(searchBarValue)
  }, [useKilograms])

  useEffect(() => {
    requestSearch(searchBarValue)
    resetToInitialPage()
  }, [recommendations])

  const escapeRegExp = (value: string): string => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  }

  const tooltipMessage =
    'Recommendations are based on cloud usage from the last 14 days, except for GCP CHANGE_MACHINE_TYPE which is from the last 8 days of usage'

  const customPaginationComponent = () => (
    <CustomPagination handlePageSizeChange={handlePageSizeChange} />
  )

  return (
    <DashboardCard>
      <>
        <Forecast
          emissionsData={emissionsData}
          recommendations={recommendations}
          useKilograms={useKilograms}
        />
        <div className={classes.recommendationsContainer}>
          <Typography className={classes.title}>Recommendations</Typography>
          <div className={classes.dateRangeContainer}>
            <DateRange lookBackPeriodDays={13} />
            <Tooltip message={tooltipMessage} />
          </div>
          <div className={classes.tableContainer}>
            <div className={classes.toolbarContainer}>
              <SearchBar
                value={searchBarValue}
                onChange={handleSearchBarChange}
                clearSearch={() => handleSearchBarChange('')}
              />
            </div>
            <DataGrid
              autoHeight
              rows={rows}
              columns={getColumns(useKilograms, recommendations)}
              columnBuffer={6}
              hideFooterSelectedRowCount={true}
              classes={{
                cell: classes.cell,
                row: classes.row,
              }}
              onRowClick={handleRowClick}
              disableColumnFilter
              pageSize={pageState.pageSize}
              components={{
                Toolbar: customPaginationComponent,
                Pagination: customPaginationComponent,
                NoRowsOverlay: () => (
                  <GridOverlay>
                    There's no data to display! Expand your search parameters to
                    get started. (Try adding accounts, regions or recommendation
                    types)
                  </GridOverlay>
                ),
              }}
              onPageSizeChange={handlePageSizeChange}
              page={pageState.page}
              onPageChange={(newPage) =>
                setPageState({ ...pageState, page: newPage })
              }
              onSortModelChange={(model) => {
                let page = pageState.page
                if (pageState.sortOrder !== model[0]?.sort) {
                  page = 0
                  setPageState({
                    ...pageState,
                    sortOrder: model[0]?.sort,
                    page,
                  })
                }
              }}
            />
          </div>
        </div>
      </>
    </DashboardCard>
  )
}

export default RecommendationsTable
