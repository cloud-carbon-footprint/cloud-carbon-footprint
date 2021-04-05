/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import React from 'react'
import Link from '@docusaurus/Link'

import styles from './innovationPartnersStyles.module.css'

const logosArray = [
  {
    path: 'img/logos/TWLogo.png',
    alt: 'ThoughtWorks logo',
    url: 'https://www.thoughtworks.com'
  },
  {
    path: 'img/logos/GOLogo.png',
    alt: 'GO logo',
    url: 'https://www.goclimate.com',
  },
  {
    path: 'img/logos/OCFLogo.png',
    alt: 'Open Climate Fix logo',
    url: 'https://openclimatefix.org',
  },
  {
    path: 'img/logos/TGWFLogo.png',
    alt: 'The Green Web Foundation logo',
    url: 'https://www.thegreenwebfoundation.org',
  },
  {
    path: 'img/logos/TMLogo.png',
    alt: 'Thinking Machines logo',
    url: 'https://thinkingmachin.es',
  },
  {
    path: 'img/logos/TeadsLogo.png',
    alt: 'Teads logo',
    url: 'https://www.teads.com',
  },
]

function InnovationPartners() {
  const Logos = () => {
    return logosArray.map((logo, index) => {
      return (
        <Link key={index} className={styles.innovationPartnerItem} to={logo.url}>
          <img
            className={styles.innovationPartnerLogo}
            alt={logo.alt}
            src={logo.path}
          />
        </Link>
      )
    })
  }

  return (
    <div className="home__subsection-box-format">
      <p className="home__subsection-title">INNOVATION PARTNERS</p>
      <div className={styles.logosContainer}>
        <Logos />
      </div>
    </div>
  )
}

export default InnovationPartners
