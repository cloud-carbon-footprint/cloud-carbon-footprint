/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import clsx from 'clsx'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import styles from './heroStyles.module.css'
import CallToActionBanner from './callToActionBanner'

function Hero() {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context
  return (
    <div>
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className={styles.heroTextContainer}>
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <h2 className={clsx(styles.heroSubtitle, styles.heroNoMarginBottom)}>
            Free and Open Source
          </h2>
        </div>
      </header>
      <CallToActionBanner />
    </div>
  )
}

export default Hero
