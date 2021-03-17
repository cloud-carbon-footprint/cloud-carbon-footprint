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
        <div>
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <p className={clsx(styles.heroSubtitle, styles.heroNoMarginBottom)}>
            Free and Open Source
          </p>
          <p className={clsx(styles.heroSubtitle, styles.heroSubtitleMargin)}>
            Cloud Carbon Emissions Measurement and Analysis Tool
          </p>
          <p
            className={clsx(
              styles.heroAdditionalText,
              styles.heroNoMarginBottom,
            )}
          >
            Understand how your cloud usage impacts our environment
          </p>
          <p className={styles.heroAdditionalText}>
            and what you can do about it
          </p>
        </div>
      </header>
      <CallToActionBanner />
    </div>
  )
}

export default Hero
