import React, { useState } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import CloudOffIcon from '@material-ui/icons/CloudOff';
import { Grid } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';

type ErrorState = {
    statusText?: string
    status?: string
}

export const useErrorHandling = () => {
    const history = useHistory()
    const [error, setError] = useState({})

    const handleApiError = (error: ErrorState) => {
        if(error.status) {
            history.push(`/error`, error)
        }
    }

    return {handleApiError, error, setError};
}

const useStyles = makeStyles((theme) => ({
    cloudIcon: {
        fontSize: "175px"
    },
    errorStatus: {
        fontSize: "36px"
    },
    errorMessage: {
        fontSize: "18px"
    },
    gridPlacement: {
        marginBottom: "25%"
    }
}))

const ErrorPage = () => {
    const location = useLocation()
    const { statusText, status } = location.state as ErrorState

    const classes = useStyles()

    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: '100vh' }}
        >
            <CloudOffIcon className={classes.cloudIcon}/>
            <Grid item className={classes.gridPlacement} xs={12}>
                <div>
                    <h1 className={classes.errorStatus}>{statusText} {status} </h1>
                    <div className={classes.errorMessage}>Something has gone wrong, please try again later</div>
                </div>
            </Grid>   
        </Grid> 
    )
}

export default ErrorPage