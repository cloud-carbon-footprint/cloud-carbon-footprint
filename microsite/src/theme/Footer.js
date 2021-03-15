import React from 'react'
import FooterImage from '../components/footerImage'
import styles from './footer.module.css'

function Footer() {
  return (
    <div>
      <FooterImage />
      <div className={styles.footerLicenseContainer}>
        <p>
          Cloud Carbon Footprint is an open-source project, sponsored by
          ThoughtWorks Inc. under the&nbsp;
          <a
            className={styles.footerLicenseLink}
            target="_blank"
            href="http://www.apache.org/licenses/LICENSE-2.0"
          >
            Apache License, Version 2.0
          </a>
        </p>
      </div>
    </div>
  )
}

export default Footer
