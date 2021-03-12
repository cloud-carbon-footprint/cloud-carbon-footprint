import React from 'react'
import MainLayout from '../components/mainLayout'
import {
  Hero,
  Overview,
  ValueProp,
  Differentiator,
  InnovationPartners,
  FooterImage,
} from '../components'

function Home() {
  return (
    <MainLayout>
      <Hero />
      <Overview />
      <ValueProp />
      <Differentiator />
      <InnovationPartners />
      <FooterImage />
    </MainLayout>
  )
}

export default Home
