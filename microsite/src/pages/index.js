import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Hero from './hero';
import Overview from './overview';
import ValueProp from './valueProp';
import Differentiator from './differentiator';
import InnovationPartners from './innovationPartners';
import FooterImage from './footerImage';

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <Hero/>
      <main>
        <Overview/>
        <ValueProp/>
        <Differentiator/>
        <InnovationPartners/>
        <FooterImage/>
      </main>
    </Layout>
  );
}

export default Home;
