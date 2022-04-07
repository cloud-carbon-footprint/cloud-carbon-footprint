/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import { Container, Divider, Grid } from '@material-ui/core'
import SidePanel from '../../../common/SidePanel'
import { RecommendationRow } from '../../../Types'
import { RecommendationsPanelRow, RecommendationsPanelColumn } from './layout'
import useStyles from './recommendationsSidePanelStyles'
import {
  tableFormatNearZero,
  tableFormatRawCo2e,
} from '../../../utils/helpers/transformData'

export type RecommendationsSidePanelProps = {
  recommendation: RecommendationRow
  onClose?: () => void
}

const RecommendationsSidePanel: FunctionComponent<
  RecommendationsSidePanelProps
> = ({ recommendation, onClose }): ReactElement => {
  const classes = useStyles()

  let resourceName = recommendation.instanceName
  if (recommendation.recommendationType.includes('EBS')) {
    resourceName = recommendation.resourceId
  } else if (recommendation.recommendationType.includes('Lambda')) {
    resourceName = recommendation.resourceId.split(':')[0]
  }
  return (
    <SidePanel
      drawerWidth={475}
      title="Recommendation Details"
      defaultIsOpen
      openOnChange={recommendation}
      onClose={onClose}
    >
      <Container className={classes.detailsContainer}>
        <RecommendationsPanelRow
          label="Cloud Provider"
          content={recommendation.cloudProvider}
        />
        <RecommendationsPanelRow
          label="Account Name"
          content={recommendation.accountName}
        />
        <RecommendationsPanelRow
          label="Account ID"
          content={recommendation.accountId}
        />
        <RecommendationsPanelRow
          label="Region"
          content={recommendation.region}
        />
        <RecommendationsPanelRow label="Resource Name" content={resourceName} />
        <RecommendationsPanelRow
          label="Resource ID"
          content={recommendation.resourceId}
        />
      </Container>
      <Divider />
      <Container className={classes.detailsContainer}>
        <RecommendationsPanelColumn
          label="Recommendation Type"
          content={recommendation.recommendationType}
        />
        <RecommendationsPanelColumn
          label="Recommendation Detail"
          content={recommendation.recommendationDetail}
          hasLeftAlignedContent
        />
      </Container>
      <Grid className={classes.savingsContainer} container wrap="nowrap">
        <RecommendationsPanelColumn
          label="Cost Savings"
          subLabel="(USD)"
          content={tableFormatNearZero(recommendation.costSavings)}
        />
        <RecommendationsPanelColumn
          label="CO2e Savings"
          subLabel={
            recommendation.useKilograms ? '(kilograms)' : '(metric tons)'
          }
          content={tableFormatRawCo2e(
            recommendation.useKilograms,
            recommendation.co2eSavings,
          )}
        />
        <RecommendationsPanelColumn
          label="Energy Savings"
          subLabel="(kilowatt hours)"
          content={tableFormatNearZero(recommendation.kilowattHourSavings)}
        />
      </Grid>
    </SidePanel>
  )
}

export default RecommendationsSidePanel
