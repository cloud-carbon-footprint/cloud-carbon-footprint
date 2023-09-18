import React from 'react'
import styles from './footer.module.css'

function FooterLink({ link, text, className }) {
  const customClassName = styles.footerLicenseLink + ' ' + className
  return (
    <a className={customClassName} target="_blank" href={link}>
      {text}
    </a>
  )
}

function Footer() {
  return (
    <div>
      <div className={styles.footerLicenseContainer}>
        <FooterLink
        link="https://www.thoughtworks.com"
        text="Made for the 🌎 by Thoughtworks"
        className={styles.signature}
        />
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
