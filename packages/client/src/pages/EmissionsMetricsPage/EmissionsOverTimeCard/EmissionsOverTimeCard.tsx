/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import { Box, Card, Grid } from '@material-ui/core'
import { ClassNameMap } from '@material-ui/styles'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import ApexLineChart from './ApexLineChart'
import NoDataMessage from 'common/NoDataMessage'

type EmissionsOverTimeProps = {
  classes: ClassNameMap<string>
  filteredData: EstimationResult[]
}

const EmissionsOverTimeCard: FunctionComponent<EmissionsOverTimeProps> = ({
  classes,
  filteredData,
}): ReactElement => (
  <Grid data-testid="cloudUsage" item xs={12}>
    <Card style={{ width: '100%', height: '100%' }}>
      <Box padding={3} paddingRight={4}>
        {filteredData.length ? (
          <ApexLineChart data={filteredData} />
        ) : (
          <div className={classes.noData}>
            <p>Cloud Usage</p>
            <NoDataMessage isTop={true} />
          </div>
        )}
      </Box>
    </Card>
  </Grid>
)

export default EmissionsOverTimeCard
