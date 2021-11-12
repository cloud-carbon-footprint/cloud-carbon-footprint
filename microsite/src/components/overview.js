import React from 'react'
import clsx from 'clsx'
import Button from '@material-ui/core/Button'
import styles from './overviewStyles.module.css'
import useStyles from './materialStyles'
import Link from '@docusaurus/Link'

function Overview() {
  const classes = useStyles()
  return (
    <section
      id="carbon-footprint-of-your-cloud-usage"
      className={styles.overviewContainer}
    >
      <div className={clsx(styles.overviewItem, styles.overviewItemImage, styles.overviewImageStack)}>
        <picture  className={styles.overviewImageStackDashboard}>
          <source srcSet="img/cloud_carbon_footprint-small.webp 600w, img/cloud_carbon_footprint.webp 1200w" />
          <img
            className={styles.overviewImageDashboard}
            type="image/webp"
            src="img/cloud_carbon_footprint-small.webp"
            alt="Cloud carbon footprint emissions dashboard, screen capture"
          />
        </picture>
        <picture className={styles.overviewImageStackRecs}>
          <source srcSet="img/cloud_carbon_footprint_recs-small.webp 600w, img/cloud_carbon_footprint_recs.webp 1200w"/>
          <img
            className={styles.overviewImageRecs}
            type="image/webp"
            src="img/cloud_carbon_footprint_recs-small.webp"
            alt="Cloud carbon footprint recommendations dashboard, screen capture"
          />
        </picture>
      </div>
      <div className={clsx(styles.overviewItem, styles.overviewItemText)}>
        <h2 className={styles.overviewTitle}>
          Get to know the carbon footprint of your cloud usage - and reduce it
        </h2>
        <p className={styles.overviewText}>
          Cloud Carbon Footprint is an open source tool that provides visibility
          and tooling to measure, monitor and reduce your cloud carbon emissions.
          We use best practice methodologies to convert cloud utilization into
          estimated energy usage and carbon emissions, producing metrics and carbon savings
          estimates that can be shared with employees, investors, and other stakeholders.
        </p>
        <Link className="button__link" to="docs/getting-started">
          <Button variant="contained" classes={{ root: classes.paddingLow }}>
            GET STARTED
          </Button>
        </Link>
      </div>
    </section>
  )
}

export default Overview
