/*
 * © 2021 Thoughtworks, Inc.
 */

import { Divider, Link, Typography } from '@material-ui/core'
import clsx from 'clsx'
import { OpenInNew } from '@material-ui/icons'
import React, { FunctionComponent } from 'react'
import SidePanel from 'common/SidePanel'
import useStyles from './emissionsSidePanelStyles'

const EmissionsSidePanel: FunctionComponent = () => {
  const classes = useStyles()
  return (
    <SidePanel title="How do we get our carbon estimates?" drawerWidth={360}>
      <Typography className={classes.content} component="p">
        Our CO2e Estimate Formula:
      </Typography>
      <Typography
        className={clsx(classes.content, classes.formula)}
        component="p"
      >
        (Cloud provider service usage) x (Cloud energy conversion factors [kWh])
        x (Cloud provider Power Usage Effectiveness (PUE)) x (grid emissions
        factors [metric tons CO2e])
      </Typography>
      <Divider />
      <Typography className={classes.content} component="p">
        Currently we estimate CO2e emissions for cloud compute, storage and
        networking. Memory usage is not estimated yet due to their arguably
        comparatively small footprint and current lack of available energy
        conversion factors.
        <br />
        <br />
        Emissions data points marked with an * have been estimated with average
        CPU Utilization because the actual CPU Utilization is not available.
        <br />
        <br />
        Cloud Provider regions on map are an approximation based on public
        information given by each cloud provider. Regional grid emissions factor
        sources vary based on country.
      </Typography>
      <Link
        href="https://www.cloudcarbonfootprint.org/docs/methodology"
        target="_blank"
        rel="noopener"
        className={classes.methodology}
      >
        Read more in our full methodology here{' '}
        <OpenInNew fontSize="small" className={classes.openIcon} />
      </Link>
    </SidePanel>
  )
}

export default EmissionsSidePanel
