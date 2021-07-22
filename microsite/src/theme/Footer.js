import { Link } from '@material-ui/core'
import React from 'react'
import FooterImage from '../components/footerImage'
import styles from './footer.module.css'

function FooterLink({ link, text }) {
  return (
    <a className={styles.footerLicenseLink} target="_blank" href={link}>
      {text}
    </a>
  )
}

function Footer() {
  return (
    <div>
      <FooterImage />
      <div className={styles.footerLicenseContainer}>
        <p>
          Cloud Carbon Footprint is an open-source project, sponsored by
          Thoughtworks Inc. under the&nbsp;
          <FooterLink
            link="http://www.apache.org/licenses/LICENSE-2.0"
            text="Apache License, Version 2.0"
          />
        </p>
        <p>
          <FooterLink
            link="https://www.thoughtworks.com/privacy-policy"
            text="PRIVACY POLICY"
          />
        </p>
      </div>
    </div>
  )
}

export default Footer
