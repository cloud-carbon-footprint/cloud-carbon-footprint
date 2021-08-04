/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import { DataGrid, GridColDef } from '@material-ui/data-grid'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import CarbonCard from 'layout/CarbonCard'

//  TODO: Increase width
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
      <div style={{ width: '100%' }}>
        <DataGrid autoHeight rows={rows} columns={columns} columnBuffer={6} />
      </div>
    </CarbonCard>
  )
}

export default RecommendationsTable
