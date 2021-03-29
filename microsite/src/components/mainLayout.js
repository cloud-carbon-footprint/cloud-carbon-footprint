import React from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

function MainLayout({ children }) {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context
  return (
    <Layout description="Cloud Carbon Emissions Measurement and Analysis Tool">
      <main>{children}</main>
    </Layout>
  )
}

export default MainLayout
