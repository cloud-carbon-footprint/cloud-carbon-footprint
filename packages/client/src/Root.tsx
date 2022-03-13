import React, { useMemo } from 'react'
import { determineTheme } from './utils/themes'
import loadConfig from './ConfigLoader'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { App } from './App'

export function Root() {
  const theme = useMemo(() => determineTheme(), [])
  const config = useMemo(() => loadConfig(), [])

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <React.StrictMode>
          <CssBaseline />
          <App config={config} />
        </React.StrictMode>
      </ThemeProvider>
    </BrowserRouter>
  )
}
