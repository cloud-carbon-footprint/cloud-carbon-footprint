/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import { DataGrid, GridColDef } from '@material-ui/data-grid'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import CarbonCard from 'layout/CarbonCard'

const columns: GridColDef[] = [
  { field: 'cloudProvider', headerName: 'Cloud Provider', width: 150 },
  {
    field: 'accountName',
    headerName: 'Account Name',
    flex: 1,
  },
  {
    field: 'region',
    headerName: 'Region',
    flex: 1,
  },
  {
    field: 'recommendationType',
    headerName: 'Recommendation Type',
    flex: 1,
  },
  {
    field: 'costSavings',
    headerName: 'Potential Cost Savings',
    type: 'number',
    flex: 1,
  },
  {
    field: 'co2eSavings',
    headerName: 'Potential Carbon Savings',
    type: 'number',
    flex: 1,
  },
]

type RecommendationsTableProps = {
  recommendations?: RecommendationResult[]
}

const RecommendationsTable: FunctionComponent<RecommendationsTableProps> = ({
  recommendations,
}): ReactElement => {
  let rows = []
  if (recommendations) {
    rows = recommendations.map((recommendation, index) => ({
      id: index,
      ...recommendation,
    }))
  }

  return (
    <CarbonCard title="Recommendations">
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} columnBuffer={6} />
      </div>
    </CarbonCard>
  )
}

export default RecommendationsTable
