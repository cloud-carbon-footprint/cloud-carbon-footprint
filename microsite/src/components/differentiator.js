import React from 'react';
import styles from './differentiator.module.css';

const differences = [
    {
        text: 'Architected to work for multiple cloud providers and displays cloud carbon metrics '
            + 'in a single, holistic view'
    },
    {
        text: 'Supports AWS and Google Cloud, with plans to add Azure and other providers, '
            + 'including potential for on-prem and co-located data centers'
    },
    {
        text: 'Ability to measure usage at a granular service level and use actual server '
         + 'utilization rather than average utilization for hyperscale data centers'
    },
    {
        text: 'Provides estimates for both energy and carbon emissions from cloud usage'
    },
    {
        text: 'Displays information in chart visual, table, or CSV'
    },
    {
        text: 'The solution is open and extensible; contributions and improvements encouraged'
    }
];

function Check({text}) {
    return (
        <div className={styles.differentiatorCheckContainer}>
            <img className={styles.differentiatorCheckIcon} src="img/check-black-24dp.svg" alt="Check icon" />
            <p className={styles.differentiatorCheckText} >{text}</p>
        </div>
    );
  }

function Differentiator() {
    return (
        <div className={styles.differentiatorContainer}>
            <div className={styles.differentiatorListItem}>
                <p className={styles.differentiatorListTitle}>Solution Differentiators</p>
                {differences.map((content, idx) => (
                  <Check key={idx} {...content} />
                ))}
            </div>
            <div className={styles.differentiatorImageItem}>
                <img src="img/placeholder.png" alt="placeholder" />
            </div>
        </div>
    )
}

export default Differentiator;
