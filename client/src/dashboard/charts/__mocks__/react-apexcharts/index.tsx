import React from 'react'

const mockChart = (props: any) => (
  <div {...props} data-testid={`fake-${props.type}-chart`}>
    fake chart
  </div>
)

export default mockChart
