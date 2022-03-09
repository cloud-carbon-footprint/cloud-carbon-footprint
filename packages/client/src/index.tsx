/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { useMemo } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@material-ui/core'

import App from './App'
import { determineTheme } from './utils/themes'

function Root() {
  const theme = useMemo(() => determineTheme(), [])

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <React.StrictMode>
          <CssBaseline />
          <App />
        </React.StrictMode>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default Root
