import React from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import HomePage from './home'
import TryNowPage from './tryNow'
import { Route, Switch } from 'react-router-dom'

function Home() {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context
  return (
    // <BrowserRouter>
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <main>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/try-now" exact component={TryNowPage} />
        </Switch>
      </main>
    </Layout>
    /* </BrowserRouter> */
  )
}

export default Home
