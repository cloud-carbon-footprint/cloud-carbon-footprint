/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  FunctionComponent,
  ReactElement,
  SyntheticEvent,
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
import Toggle from '../../../common/Toggle'

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
  const classes = useStyles()

  let rows = []
  if (recommendations) {
    rows = recommendations.map((recommendation, index) => {
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
    })
  }

  return (
    <CarbonCard title="Recommendations">
      <div className={classes.tableContainer}>
        <div className={classes.toggleContainer}>
          <Toggle label={'CO2e Units'} handleToggle={setUseKilograms} />
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
        />
      </div>
    </CarbonCard>
  )
}

export default RecommendationsTable
