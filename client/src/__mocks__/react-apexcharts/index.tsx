import React from 'react'

export default (props: any) => (
  <div {...props} data-testid={`fake-${props.type}-chart`}>
    fake chart
  </div>
)
