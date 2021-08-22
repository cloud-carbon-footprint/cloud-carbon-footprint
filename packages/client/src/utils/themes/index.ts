/*
 * © 2021 Thoughtworks, Inc.
 */

import { CSSProperties } from 'react'
import { createMuiTheme, Theme } from '@material-ui/core/styles'

declare module '@material-ui/core/styles/createPalette' {
  /* eslint-disable */
  interface Palette {
    chart: Palette['primary'][]
    primaryBlue: CSSProperties['color']
    lightBlue: CSSProperties['color']
    lightTitle: CSSProperties['color']
    lightMessage: CSSProperties['color']
    extLink: CSSProperties['color']
  }
  /* eslint-disable */
  interface PaletteOptions {
    chart: PaletteOptions['primary'][]
    primaryBlue: CSSProperties['color']
    lightBlue: CSSProperties['color']
    lightTitle: CSSProperties['color']
    lightMessage: CSSProperties['color']
    extLink: CSSProperties['color']
  }
}

const determineTheme = (): Theme => {
  return createMuiTheme({
    palette: {
      type: 'light',
      background: {
        default: '#F1F1F1',
      },
      chart: [
        // primary
        { main: '#2C82BE' },
        { main: '#B8DCF5' },
        { main: '#76DDF8' },
        { main: '#53A8E2' },
        { main: '#F05D5E' },
        { main: '#FFCF00' },
        { main: '#87D68D' },
        { main: '#04E762' },
        { main: '#3E885B' },
        { main: '#F194B4' },
        // secondary
        { main: '#0A2239' },
        { main: '#7C2E86' },
        { main: '#3772FF' },
        { main: '#F038FF' },
        { main: '#EF709D' },
        { main: '#E2EF70' },
        { main: '#70E4EF' },
      ],
      primaryBlue: '#3F51B5',
      lightBlue: 'rgba(63, 81, 181, 0.08)',
      lightTitle: 'rgba(0, 0, 0, 0.87)',
      lightMessage: '#b0bec5',
      // leaving this here in case the color theme changes base on dark mode
      extLink: '#00B7FF',
    },
  })
}

const getChartColors = (theme: Theme) => {
  return theme.palette.chart.map(({ main }) => main)
}

export { determineTheme, getChartColors }
