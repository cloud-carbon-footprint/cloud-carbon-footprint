/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  barChartContainer: {
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
  },
}))

export default useStyles
