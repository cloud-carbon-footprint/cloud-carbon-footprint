/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import Link from '@docusaurus/Link'

import styles from './innovationPartnersStyles.module.css'

const logosArray = [
  {
    path: 'img/logos/TWLogo-small.webp',
    alt: 'Thoughtworks logo',
    url: 'https://www.thoughtworks.com',
  },
  {
    path: 'img/logos/TomorrowLogo-small.webp',
    alt: 'Tomorrow logo',
    url: 'https://www.tmrow.com',
  },
  {
    path: 'img/logos/GOLogo.webp',
    alt: 'GO logo',
    url: 'https://www.goclimate.com',
  },
  {
    path: 'img/logos/OCFLogo.webp',
    alt: 'Open Climate Fix logo',
    url: 'https://openclimatefix.org',
  },
  {
    path: 'img/logos/TGWFLogo.webp',
    alt: 'The Green Web Foundation logo',
    url: 'https://www.thegreenwebfoundation.org',
  },
  {
    path: 'img/logos/TMLogo.webp',
    alt: 'Thinking Machines logo',
    url: 'https://thinkingmachin.es',
  },
  {
    path: 'img/logos/TeadsLogo.webp',
    alt: 'Teads logo',
    url: 'https://www.teads.com',
  },
  {
    path: 'img/logos/USCSLogo.webp',
    alt: 'US Coalition on Sustainability logo',
    url: 'https://www.uscoalitiononsustainability.org',
  },
  {
    path: 'img/logos/VirtasantLogo-small.webp',
    alt: 'Virtasant logo',
    url: 'https://www.virtasant.com/',
  },
]

function InnovationPartners() {
  const Logos = () => {
    return logosArray.map((logo, index) => {
      return (
        <Link
          key={index}
          className={styles.innovationPartnerItem}
          to={logo.url}
        >
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
    <section id="innovation-partners">
      <div className="home__subsection-box-format">
        <h2 className="home__subsection-title">INNOVATION PARTNERS</h2>
        <div className={styles.logosContainer}>
          <Logos />
        </div>
      </div>
    </section>
  )
}

export default InnovationPartners
