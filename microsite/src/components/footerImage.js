import React from 'react'
import styles from './footerImage.module.css'
import Button from '@material-ui/core/Button'
import useStyles from './materialStyles'
import Link from '@docusaurus/Link'

function FooterImage() {
  const classes = useStyles()
  return (
    <div className={styles.footerImageContainer}>
      <div>
        <p className={styles.footerImageTitle}>Have a Question?</p>
        <Link to="https://groups.google.com/g/cloud-carbon-footprint">
          <Button variant="contained" classes={{ root: classes.paddingHigh }}>
            JOIN OUR DISCUSSION FORUM
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default FooterImage
