import React from 'react'
import styles from './innovationPartnersStyles.module.css'

const logosArray = [
  {
    path: 'img/logos/TWLogo.png',
    alt: 'ThoughtWorks logo',
  },
  {
    path: 'img/logos/GOLogo.png',
    alt: 'GO logo',
  },
  {
    path: 'img/logos/OCFLogo.png',
    alt: 'Open Climate Fix logo',
  },
]

function InnovationPartners() {
  const Logos = () => {
    return logosArray.map((logo, index) => {
      return (
        <div key={index} className={styles.innovationPartnerItem}>
          <img
            className={styles.innovationPartnerLogo}
            alt={logo.alt}
            src={logo.path}
          />
        </div>
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
