import React from 'react'
import styles from './footerImage.module.css'
import Button from '@material-ui/core/Button'
import useStyles from './materialStyles'
import Link from '@docusaurus/Link'

function FooterImage() {
  const classes = useStyles()
  return (
    <section id="have-a-question">
      <div className={styles.footerImageContainer}>
        <div>
          <h2 className={styles.footerImageTitle}>Have a Question?</h2>
          <Link to="https://groups.google.com/g/cloud-carbon-footprint">
            <Button variant="contained" classes={{ root: classes.paddingHigh }}>
              JOIN OUR DISCUSSION FORUM
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FooterImage
