/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import NoDataMessage from '../../../common/NoDataMessage'
import DashboardCard from '../../../layout/DashboardCard'
import ApexLineChart from './ApexLineChart/ApexLineChart'

type EmissionsOverTimeProps = {
  filteredData: EstimationResult[]
}

const EmissionsOverTimeCard: FunctionComponent<EmissionsOverTimeProps> = ({
  filteredData,
}): ReactElement =>
  filteredData.length ? (
    <DashboardCard testId="cloudUsage">
      <ApexLineChart data={filteredData} />
    </DashboardCard>
  ) : (
    <NoDataMessage isTop isBold title="Cloud Usage" />
  )

export default EmissionsOverTimeCard
