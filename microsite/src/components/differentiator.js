/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import styles from './differentiator.module.css'

const differences = [
  {
    text:
      'Architected to work for multiple cloud providers including, AWS, Google Cloud, ' +
      'and Microsoft Azure, and displays cloud carbon metrics in a single holistic view',
  },
  {
    text:
      'Ability to measure usage at a granular service level and use actual server ' +
      'utilization rather than average utilization for hyperscale data centers',
  },
  {
    text:
      'Provides estimates for both energy and carbon emissions from cloud usage',
  },
  {
    text:
      'Monitors your energy usage and carbon footprint visually via graphs and ' +
      'charts, with the ability to keep track of data in tables and export metrics in ' +
      'CSV to share with stakeholders',
  },
  {
    text:
      'The solution is open and extensible with the potential to add other cloud ' +
      'providers, on-prem or co-located data centers',
  },
]

function Check({ text }) {
  return (
    <div className={styles.differentiatorCheckContainer}>
      <img
        className={styles.differentiatorCheckIcon}
        src="img/check-black-24dp.svg"
        alt="Check icon"
      />
      <p className={styles.differentiatorCheckText}>{text}</p>
    </div>
  )
}

function Differentiator() {
  return (
    <section id="solution-differentiators">
      <div className={styles.differentiatorContainer}>
        <div className={styles.differentiatorListItem}>
          <h2 className={styles.differentiatorListTitle}>
            Solution Differentiators
          </h2>
          {differences.map((content, idx) => (
            <Check key={idx} {...content} />
          ))}
        </div>
        <div className={styles.differentiatorImageItem}>
          <img
            className={styles.overviewImage}
            src="img/infographic.webp"
            alt="Infographic showing the different paths data taken from the cloud providers may take: our frontend app, CLI app, raw data or analysis your way"
          />
        </div>
      </div>
    </section>
  )
}

export default Differentiator
