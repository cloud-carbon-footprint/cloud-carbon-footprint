/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { useMemo } from 'react'
import ReactDOM from 'react-dom'
import { determineTheme } from './utils/themes'
import { ThemeProvider, CssBaseline } from '@material-ui/core'

import App from './App'

import { Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'
const history = createBrowserHistory()

function Root() {
  const theme = useMemo(() => determineTheme(), [])

  return (
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <React.StrictMode>
          <CssBaseline />
          <App />
        </React.StrictMode>
      </ThemeProvider>
    </Router>
  )
}

ReactDOM.render(<Root />, document.getElementById('root'))
