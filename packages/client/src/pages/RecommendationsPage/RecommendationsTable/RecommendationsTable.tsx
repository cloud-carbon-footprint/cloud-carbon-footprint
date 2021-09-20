/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  FunctionComponent,
  ReactElement,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react'
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  MuiEvent,
} from '@material-ui/data-grid'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import CarbonCard from 'layout/CarbonCard'
import useStyles from './recommendationsTableStyles'
import Toggle from 'common/Toggle'
import DateRange from 'common/DateRange'
import Tooltip from '../../../common/Tooltip'
import SearchBar from '../SearchBar'

type RecommendationsTableProps = {
  recommendations: RecommendationResult[]
  handleRowClick: (
    params: GridRowParams,
    event: MuiEvent<SyntheticEvent>,
  ) => void
}

const getColumns = (useKilograms: boolean): GridColDef[] => [
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
    flex: 0.75,
  },
]

const RecommendationsTable: FunctionComponent<RecommendationsTableProps> = ({
  recommendations,
  handleRowClick,
}): ReactElement => {
  const [useKilograms, setUseKilograms] = useState(false)
  const [searchBarValue, setSearchBarValue] = useState('')
  const [rows, setRows] = useState([])
  const [tableRecommendations, setTableRecommendations] =
    useState(recommendations)
  const classes = useStyles()

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
            if (key.includes('Savings') && recommendationRow[key] != '-')
              recommendationRow[key] =
                Math.round(recommendationRow[key] * 1000) / 1000
          })
          return recommendationRow
        },
      )
      setRows(recommendationRows)
      setTableRecommendations(recommendations)
    }
  }

  const handleSearchBarChange = (value: string) => {
    setSearchBarValue(value)
    requestSearch(value)
  }

  const handleToggle = (value: boolean) => {
    setUseKilograms(value)
    requestSearch(searchBarValue)
  }

  const requestSearch = (searchValue: string) => {
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')
    const filteredRecommendations = recommendations.filter((row: any) => {
      return Object.keys(row).some((field: any) => {
        return searchRegex.test(row[field].toString())
      })
    })
    createRecommendationRows(filteredRecommendations)
  }

  useEffect(() => {
    createRecommendationRows(tableRecommendations)
  }, [tableRecommendations, useKilograms])

  const escapeRegExp = (value: string): string => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  }

  const tooltipMessage =
    'Recommendations are based on cloud usage from the last 14 days, except for GCP CHANGE_MACHINE_TYPE which is from the last 8 days of usage'

  return (
    <CarbonCard title="Recommendations">
      <>
        <div className={classes.dateRangeContainer}>
          <DateRange lookBackPeriodDays={13} />
          <Tooltip message={tooltipMessage} />
        </div>
        <div className={classes.tableContainer}>
          <div className={classes.toggleAndDateRangeContainers}>
            <SearchBar
              value={searchBarValue}
              onChange={handleSearchBarChange}
              clearSearch={() => console.log('hello')}
            />
            <div className={classes.toggleContainer}>
              <Toggle label={'CO2e Units'} handleToggle={handleToggle} />
            </div>
          </div>
          <DataGrid
            autoHeight
            rows={rows}
            columns={getColumns(useKilograms)}
            columnBuffer={6}
            hideFooterSelectedRowCount={true}
            classes={{
              cell: classes.cell,
              row: classes.row,
            }}
            onRowClick={handleRowClick}
            disableColumnFilter
          />
        </div>
      </>
    </CarbonCard>
  )
}

export default RecommendationsTable
