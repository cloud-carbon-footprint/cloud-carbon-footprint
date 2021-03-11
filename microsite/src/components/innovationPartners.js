import React from 'react';
import styles from './innovationPartnersStyles.module.css';


const logosArray = [
    {
        path: 'img/tw-logo.svg',
        alt: 'ThoughtWorks logo'
    },
    {
        path: 'img/TW-logo-green.jpg',
        alt: 'ThoughtWorks logo'
    },
    {
        path: 'img/tw-logo.svg',
        alt: 'ThoughtWorks logo'
    },
    {
        path: 'img/TW-logo-green.jpg',
        alt: 'ThoughtWorks logo'
    }
]



function InnovationPartners(){

    const Logos = ()=>{
        return logosArray.map((logo,index)=>{
            return (<div key={index} className={styles.innovationPartnerItem}>
                <img alt={logo.alt} src={logo.path} />
            </div>)
        })
    }

    return <div className="home__subsection-box-format">
        <p className="home__subsection-title">INNOVATION PARTNERS</p>
        <div className={styles.logosContainer}>
            <Logos />
        </div>
    </div>

}

export default InnovationPartners;