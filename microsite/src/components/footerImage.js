import React from 'react';
import styles from './footerImage.module.css';
import Button from '@material-ui/core/Button';
import useStyles from './materialStyles';

function FooterImage() {
    const classes = useStyles();
    return (
        <div className={styles.footerImageContainer}>
            <div>
                <p className={styles.footerImageTitle}>Have a Question?</p>
                <Button variant="contained" classes={{root: classes.paddingHigh}} >
                    JOIN OUR DISCUSSION FORUM
                </Button>
            </div>
        </div>
    )
}

export default FooterImage;