import React from 'react'
import Button from '@material-ui/core/Button'
import Link from '@docusaurus/Link'
import styles from './discussionGroup.module.css'
import useStyles from './materialStyles'

function DiscussionGroup() {
  const classes = useStyles()
  const twLogo =   {
      path: 'img/logos/TWLogo-small.webp',
      alt: 'Thoughtworks logo',
      url: 'https://www.thoughtworks.com',
    }

  return (
    <section className="home__subsection-box-format" id="have-a-question">
      <div className={styles.footerImageContainer}>
        <div>
          <h2 className={styles.footerImageTitle}>Sponsored by</h2>
          <Link
            className={styles.twLogoContainer}
            to={twLogo.url}
          >
            <img
              className={styles.twLogo}
              alt={twLogo.alt}
              src={twLogo.path}
            />
          </Link>
        </div>
        <div className={styles.line} />
        <div>
          <h2 className={styles.footerImageTitle}>Have a Question?</h2>
          <Link to="https://groups.google.com/g/cloud-carbon-footprint">
            <Button variant="contained" classes={{ root: classes.paddingHighWithMargin }}>
              JOIN OUR DISCUSSION FORUM
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DiscussionGroup
