import React from 'react'
import Head from '@docusaurus/Head'

function MetaData() {
  const title =
    'Cloud Carbon Footprint - An open source tool to measure and analyze cloud carbon emissions'
  const description =
    'An open source tool to measure and analyze cloud carbon emissions'
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <img
        src="https://www.cloudcarbonfootprint.org/img/social-share-image.png"
        alt="Cloud carbon footprint tool screen capture"
      />
      <meta property="og:title" content={title}></meta>
      <meta property="og:type" content="website"></meta>
      <meta
        property="og:url"
        content="https://www.cloudcarbonfootprint.org/"
      ></meta>
      <meta property="og:description" content={description}></meta>
      <meta
        property="og:image"
        content="https://www.cloudcarbonfootprint.org/img/social-share-image.png"
      />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta
        name="twitter:image"
        content="https://www.cloudcarbonfootprint.org/img/twtr-share-image.png"
      />
    </Head>
  )
}

export default MetaData
