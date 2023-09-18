import React from 'react'
import MainLayout from '../components/mainLayout'
import {
  Hero,
  Overview,
  ValueProp,
  Differentiator,
  InnovationPartners,
  MetaData,
  DiscussionGroup
} from '../components'

function Home() {
  return (
    <MainLayout>
      <MetaData />
      <Hero />
      <Overview />
      <ValueProp />
      <Differentiator />
      <DiscussionGroup />
      <InnovationPartners />
    </MainLayout>
  )
}

export default Home
