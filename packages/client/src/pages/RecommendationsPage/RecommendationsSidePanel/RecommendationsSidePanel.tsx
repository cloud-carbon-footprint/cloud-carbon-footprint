/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import { Typography } from '@material-ui/core'
import SidePanel from 'common/SidePanel'
import { RecommendationRow } from 'Types'

type RecommendationsSidePanelProps = {
  recommendation: RecommendationRow
}

const RecommendationsSidePanel: FunctionComponent<RecommendationsSidePanelProps> =
  ({ recommendation }): ReactElement => (
    <SidePanel drawerWidth={340} title="Recommendation Details" defaultIsOpen>
      <div>
        Cloud Provider
        <Typography component="p">{recommendation.cloudProvider}</Typography>
      </div>
      <div>
        Account Name
        <Typography component="p">{recommendation.accountName}</Typography>
      </div>
      <div>
        Account ID
        <Typography component="p">{recommendation.accountId}</Typography>
      </div>

      <div>
        Region
        <Typography component="p">{recommendation.region}</Typography>
      </div>

      <div>
        Recommendation Type
        <Typography component="p">
          {recommendation.recommendationType}
        </Typography>
      </div>

      <div>
        Recommendation Details
        <Typography component="p">
          {recommendation.recommendationDetail}
        </Typography>
      </div>
    </SidePanel>
  )

export default RecommendationsSidePanel
