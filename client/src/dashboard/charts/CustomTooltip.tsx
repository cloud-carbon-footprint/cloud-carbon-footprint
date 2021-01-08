/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

/*
We're using a custom tool tip so that we can show data from the wattHours and cost series in the tooltip,
even when the wattHours and cost series are toggled off. When using the default tooltip provided by apex charts,
there is no way to access additional data in the series, for example, the wattHours and cost data in the co2e series.
The custom tooltip also allows us to add an asterisk for data points that were estimated using an average CPU constant.
 */

import React, { ReactElement } from 'react'
import moment from 'moment'
import { cloudEstPerDay } from '../../models/types'

export const CustomTooltip = ({
  data,
  dataPointIndex,
}: {
  data: cloudEstPerDay[]
  dataPointIndex: number
}): ReactElement => {
  const date = moment.utc(data[dataPointIndex].x).format('MMMM DD')
  return (
    <div style={{ padding: '10px' }}>
      <div>
        <b>{date}</b>
      </div>
      {data[dataPointIndex].usesAverageCPUConstant ? (
        <div>{data[dataPointIndex].y} mt CO2e*</div>
      ) : (
        <div> {data[dataPointIndex].y} mt CO2e</div>
      )}
      <div>{data[dataPointIndex].wattHours} watt hrs</div>
      <div>${data[dataPointIndex].cost} cost</div>
    </div>
  )
}
