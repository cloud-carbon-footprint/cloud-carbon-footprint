/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { Theme } from '@material-ui/core/styles'

type ReactStyleProperties = {
  [className: string]: React.CSSProperties
}

const useStyles = ({ palette }: Theme): ReactStyleProperties => ({
  timelineWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: '10px 45px',
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
    backgroundColor: palette.grey.A200,
  },
})

export default useStyles
