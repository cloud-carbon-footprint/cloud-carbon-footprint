/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { ReactElement } from 'react'
import carbonIntensityRangeStyles from './carbonIntensityRangeStyles'

type TimeLineProps = {
  startLabel: string
  endLabel: string
  colorRange: string[]
}

const { timelineWrapper, timelineStyles, dotStyles, barStyles, labelsStyle } =
  carbonIntensityRangeStyles

const CarbonIntensityRange = (props: TimeLineProps): ReactElement => {
  const { startLabel, endLabel, colorRange = [] } = props

  const Dot = (props: { color: string }): ReactElement => (
    <div
      data-testid="timeline-dot"
      className="t-dot"
      style={{ ...dotStyles, backgroundColor: props.color }}
    />
  )

  const Bar = (): ReactElement => <div className="t-bar" style={barStyles} />

  const getChartItems = colorRange.reduce(
    (acc: ReactElement[], color: string, i) => {
      acc.push(<Dot key={color} color={color} />)
      if (colorRange.length !== i + 1) {
        acc.push(<Bar key={`bar-${color}`} />)
      }
      return acc
    },
    [],
  )

  return (
    <div style={timelineWrapper}>
      <div style={labelsStyle}>
        <div>{startLabel}</div>
        <div>{endLabel}</div>
      </div>
      <div style={timelineStyles}>{getChartItems}</div>
    </div>
  )
}

export default CarbonIntensityRange
