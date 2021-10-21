/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import { Container, IconButton, Modal, Typography } from '@material-ui/core'
import { Close, Warning } from '@material-ui/icons'
import DashboardCard from '../DashboardCard'
import useStyles from './mobileWarningStyles'

type MobileWarningProps = {
  handleClose?: () => void
}

const MobileWarning: FunctionComponent<MobileWarningProps> = ({
  handleClose,
}): ReactElement => {
  const classes = useStyles()

  return (
    <Modal data-testid="warning-modal" open>
      <Container className={classes.container}>
        <DashboardCard noPadding containerClass={classes.card}>
          <>
            <div className={classes.closeButtonContainer}>
              <IconButton onClick={handleClose}>
                <Close data-testid="closeIcon" />
              </IconButton>
            </div>
            <div className={classes.contentContainer}>
              <Typography className={classes.title}>
                Proceed with Caution!
              </Typography>
              <Warning data-testid="warning-icon" className={classes.icon} />
              <Typography>
                This app is not intended for use on smaller devices. For the
                best experience, please view it on a larger screen.
              </Typography>
            </div>
          </>
        </DashboardCard>
      </Container>
    </Modal>
  )
}

export default MobileWarning
