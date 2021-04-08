import React from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

function MainLayout({ children }) {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context
  return (
    <Layout description="An open source tool to measure and analyze cloud carbon emissions">
      <main>{children}</main>
    </Layout>
  )
}

export default MainLayout
