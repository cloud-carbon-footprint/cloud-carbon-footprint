import React from 'react';
import styles from './footerImage.module.css';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        background: '#146133',
        color: 'white',
        padding: '14px 90px',
        fontFamily: 'Helvetica',
        fontSize: '12pt',
        letterSpacing: '1px',
        [theme.breakpoints.down('xs')]: {
            padding: '10px 40px'
        },
        '&:hover': {
            backgroundColor: '#067A3E'
        }
    }
  }));

function FooterImage() {
    const classes = useStyles();
    return (
        <div className={styles.footerImageContainer}>
            <div>
                <p className={styles.footerImageTitle}>Have a Question?</p>
                <Button variant="contained" classes={{root: classes.root}} >
                    JOIN OUR DISCUSSION FORUM
                </Button>
            </div>
        </div>
    )
}

export default FooterImage;