import React from 'react'
import clsx from 'clsx'
import Button from '@material-ui/core/Button'
import styles from './overviewStyles.module.css'
import useStyles from './materialStyles'
import { Link } from 'react-router-dom'

function Overview() {
  const classes = useStyles()
  return (
    <div className={styles.overviewContainer}>
      <div className={clsx(styles.overviewItem, styles.overviewItemImage)}>
        <img
          className={styles.overviewImage}
          src="img/cloud_carbon_footprint.jpeg"
          alt="Cloud carbon footprint tool screen capture"
        />
      </div>
      <div className={clsx(styles.overviewItem, styles.overviewItemText)}>
        <p className={styles.overviewTitle}>
          Get to know the carbon footprint of your cloud usage - and reduce it
        </p>
        <p className={styles.overviewText}>
          Cloud Carbon Footprint is an open source tool that provides visibility
          and tooling to measure, monitor and reduce your cloud carbon
          emissions. We use best practice methodologies to convert cloud
          utilization into estimated energy usage and carbon emissions,
          producing metrics that can be shared with employees, investors, and
          other stakeholders.
        </p>
        <Link to="/try-now">
          <Button variant="contained" classes={{ root: classes.paddingLow }}>
            TRY NOW
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Overview
