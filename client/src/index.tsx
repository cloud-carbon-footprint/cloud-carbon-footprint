/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { useMemo } from 'react'
import ReactDOM from 'react-dom'
import { determineTheme } from './themes'
import { ThemeProvider, CssBaseline } from '@material-ui/core'

import App from './App'

function Root() {
  const theme = useMemo(() => determineTheme(), [])

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
