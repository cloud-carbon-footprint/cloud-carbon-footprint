import React from 'react'
import MainLayout from '../components/mainLayout'
import {
  Hero,
  Overview,
  ValueProp,
  Differentiator,
  InnovationPartners,
} from '../components'

function Home() {
  return (
    <MainLayout>
      <Hero />
      <Overview />
      <ValueProp />
      <Differentiator />
      <InnovationPartners />
    </MainLayout>
  )
}

export default Home
