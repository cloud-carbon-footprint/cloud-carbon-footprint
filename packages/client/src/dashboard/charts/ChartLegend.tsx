import React, { ReactElement } from 'react'

interface TimeLineProps {
  startLabel: string
  endLabel: string
  colorRange: string[]
}

const { timelineWrapper, timelineStyles, dotStyles, barStyles, labelsStyle } = {
  timelineWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: '0 45px',
    alignSelf: 'center',
  },
  labelsStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '12px',
    fontWeight: 500,
  },
  timelineStyles: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotStyles: {
    width: '15px',
    height: '15px',
    borderRadius: '8px',
  },
  barStyles: {
    flexGrow: 2,
    height: '1px',
    backgroundColor: '#ababab',
  },
}

export default function BasicTimeline(props: TimeLineProps): ReactElement {
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
    <div style={timelineWrapper as React.CSSProperties}>
      <div style={labelsStyle}>
        <div>{startLabel}</div>
        <div>{endLabel}</div>
      </div>
      <div style={timelineStyles}>{getChartItems}</div>
    </div>
  )
}
