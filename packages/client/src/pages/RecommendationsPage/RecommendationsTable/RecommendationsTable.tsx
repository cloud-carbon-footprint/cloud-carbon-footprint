/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement, SyntheticEvent } from 'react'
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  MuiEvent,
} from '@material-ui/data-grid'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import CarbonCard from 'layout/CarbonCard'
import useStyles from './recommendationsTableStyles'

const columns: GridColDef[] = [
  { field: 'cloudProvider', headerName: 'Cloud Provider', width: 175 },
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
    type: 'number',
    flex: 0.75,
  },
  {
    field: 'co2eSavings',
    headerName: 'Potential Carbon Savings (metric tons)',
    type: 'number',
    flex: 0.75,
  },
]

type RecommendationsTableProps = {
  recommendations: RecommendationResult[]
  handleRowClick: (
    params: GridRowParams,
    event: MuiEvent<SyntheticEvent>,
  ) => void
}

const RecommendationsTable: FunctionComponent<RecommendationsTableProps> = ({
  recommendations,
  handleRowClick,
}): ReactElement => {
  const classes = useStyles()
  let rows = []
  if (recommendations) {
    rows = recommendations.map((recommendation, index) => ({
      id: index,
      ...recommendation,
    }))
  }

  return (
    <CarbonCard title="Recommendations">
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          columnBuffer={6}
          classes={{ cell: classes.cell, row: classes.row }}
          onRowClick={handleRowClick}
        />
      </div>
    </CarbonCard>
  )
}

export default RecommendationsTable
