/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement } from 'react'
import { useTheme } from '@material-ui/core'
import useStyles from './carbonIntensityRangeStyles'

type TimeLineProps = {
  startLabel: string
  endLabel: string
  colorRange: string[]
}

const CarbonIntensityRange = (props: TimeLineProps): ReactElement => {
  const { startLabel, endLabel, colorRange = [] } = props

  const { timelineWrapper, timelineStyles, dotStyles, barStyles, labelsStyle } =
    useStyles(useTheme())

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
