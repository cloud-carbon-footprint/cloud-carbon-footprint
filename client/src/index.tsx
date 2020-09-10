import React, { useMemo } from 'react'
import ReactDOM from 'react-dom'
import { determineTheme } from './themes'
import { ThemeProvider, useMediaQuery, CssBaseline } from '@material-ui/core'

import App from './App'

function Root() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(() => determineTheme(prefersDarkMode), [prefersDarkMode])

  return (
    <ThemeProvider theme={theme}>
      <React.StrictMode>
        <CssBaseline />
        <App />
      </React.StrictMode>
    </ThemeProvider>
  )
}

ReactDOM.render(<Root />, document.getElementById('root'))
