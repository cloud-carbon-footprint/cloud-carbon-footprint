import React from 'react'
import Link from '@docusaurus/Link'
import Button from '@material-ui/core/Button'
import useStyles from './materialStyles'

import styles from './callToActionBanner.module.css'

function CallToActionBanner() {
  const classes = useStyles()
  return (
    <div className={styles.callToActionBannerContainer}>
      <div className={styles.text}>
        <h2>Cloud Carbon Emissions Measurement and Analysis Tool</h2>
        <p>
          Understand how your cloud usage impacts our environment and what you
          can do about it
        </p>
      </div>
      <Link to="docs/getting-started">
        <Button
          variant="outlined"
          classes={{ root: classes.paddingLow }}
          style={{
            borderColor: '#ffffff',
          }}
        >
          TRY NOW
        </Button>
      </Link>
    </div>
  )
}

export default CallToActionBanner
