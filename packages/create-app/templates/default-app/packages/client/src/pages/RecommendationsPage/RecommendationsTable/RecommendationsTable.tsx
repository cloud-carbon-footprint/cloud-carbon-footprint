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
  GridCellParams,
  GridColDef,
  GridOverlay,
  GridRowParams,
  MuiEvent,
} from '@mui/x-data-grid'
import {
  RecommendationResult,
  ServiceData,
} from '@cloud-carbon-footprint/common'
import { Typography } from '@material-ui/core'
import DashboardCard from '../../../layout/DashboardCard'
import useStyles from './recommendationsTableStyles'
import DateRange from '../../../common/DateRange'
import Tooltip from '../../../common/Tooltip'
import SearchBar from '../SearchBar'
import Forecast from './Forecast/Forecast'
import CustomPagination from './CustomPagination'
import {
  tableFormatNearZero,
  tableFormatRawCo2e,
} from '../../../utils/helpers/transformData'
import { Co2eUnit, RecommendationRow } from '../../../Types'
import RecommendationsSidePanel from '../RecommendationsSidePanel'
import { co2eUnitAbbreviation } from '../../../utils/helpers'

type RecommendationsTableProps = {
  emissionsData: ServiceData[]
  recommendations: RecommendationResult[]
  co2eUnit: Co2eUnit
}

const getColumns = (co2eUnit: Co2eUnit): GridColDef[] => [
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
    renderCell: (params) => {
      if (typeof params.value === 'number') {
        return tableFormatNearZero(params.value)
      } else {
        return '-'
      }
    },
  },
  {
    field: 'co2eSavings',
    headerName: `Potential Carbon Savings (${co2eUnitAbbreviation[co2eUnit]})`,
    renderCell: (params: GridCellParams) => {
      if (typeof params.value === 'number') {
        return tableFormatRawCo2e(co2eUnit, params.value)
      } else {
        return '-'
      }
    },
    flex: 0.75,
  },
]

const RecommendationsTable: FunctionComponent<RecommendationsTableProps> = ({
  emissionsData,
  recommendations,
  co2eUnit,
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
            co2eUnit: co2eUnit,
            co2eSavings: recommendation.co2eSavings,
          }
          // Replace any undefined values and round numbers to thousandth decimal
          Object.keys(recommendation).forEach((key) => {
            recommendationRow[key] = recommendationRow[key] ?? '-'
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

  const escapeRegExp = (value: string): string => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
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
            if (field === 'co2eSavings') {
              value = tableFormatRawCo2e(co2eUnit, value)
            } else if (field === 'costSavings') {
              value = tableFormatNearZero(value)
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
  }, [co2eUnit])

  useEffect(() => {
    requestSearch(searchBarValue)
    resetToInitialPage()
  }, [recommendations])

  const tooltipMessage =
    'Recommendations are based on cloud usage from the last 14 days, except for GCP CHANGE_MACHINE_TYPE which is from the last 8 days of usage. ' +
    'Estimates marked with a dash (-) do not yet have an appropriate methodology to calculate the associated energy or carbon savings.'

  const customPaginationComponent = () => (
    <CustomPagination handlePageSizeChange={handlePageSizeChange} />
  )

  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RecommendationRow>()

  const handleRowClick = (
    params: GridRowParams,
    _event: MuiEvent<SyntheticEvent>,
  ) => {
    if (selectedRecommendation && params.row.id === selectedRecommendation.id) {
      setSelectedRecommendation(undefined)
    } else {
      setSelectedRecommendation(params.row as RecommendationRow)
    }
  }

  return (
    <>
      {selectedRecommendation && (
        <RecommendationsSidePanel
          recommendation={selectedRecommendation}
          onClose={() => setSelectedRecommendation(undefined)}
        />
      )}
      <DashboardCard>
        <>
          <Forecast
            emissionsData={emissionsData}
            recommendations={recommendations}
            co2eUnit={co2eUnit}
          />
          <div className={classes.recommendationsContainer}>
            <Typography className={classes.title}>Recommendations</Typography>
            <div className={classes.dateRangeContainer}>
              <DateRange lookBackPeriodDays={13} />
              <Tooltip message={tooltipMessage} />
            </div>
            <div
              data-testid="recommendations-data-grid"
              className={classes.tableContainer}
            >
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
                columns={getColumns(co2eUnit)}
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
                      There's no data to display! Expand your search parameters
                      to get started. (Try adding accounts, regions or
                      recommendation types)
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
    </>
  )
}

export default RecommendationsTable
