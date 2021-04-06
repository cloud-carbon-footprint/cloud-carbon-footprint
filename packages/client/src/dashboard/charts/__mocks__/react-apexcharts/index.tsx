/*
 * © 2021 ThoughtWorks, Inc.
 */

import React from 'react'

/* eslint-disable */
const mockChart = (props: any) => (
  <div {...props} data-testid={`fake-${props.type}-chart`}>
    fake chart
  </div>
)

export default mockChart
