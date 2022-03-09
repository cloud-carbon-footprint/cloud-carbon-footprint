/*
 * © 2021 Thoughtworks, Inc.
 */

import { Divider, Link, Typography } from '@material-ui/core'
import clsx from 'clsx'
import { OpenInNew } from '@material-ui/icons'
import React, { FunctionComponent } from 'react'
import SidePanel from '../../../common/SidePanel'
import useStyles from './emissionsSidePanelStyles'

export const Methodology: FunctionComponent = () => {
  const classes = useStyles()
  return (
    <>
      <Typography className={classes.content} component="p">
        Our CO2e Estimate Formula:
      </Typography>
      <Typography
        className={clsx(classes.content, classes.formula)}
        component="p"
      >
        Total CO2e = operational emissions + embodied Emissions
        <br />
        Where:
        <br />
        Operational emissions = (Cloud provider service usage) x (Cloud energy
        conversion factors [Wh]) x (Cloud provider Power Usage Effectiveness
        [PUE]) x (grid emissions factors [metric tons CO2e])
        <br />
        And:
        <br />
        Embodied Emissions = estimated metric tons CO2e emissions from the
        manufacturing of datacenter servers, for compute usage
      </Typography>
      <Divider />
      <Typography className={classes.content} component="p">
        Cloud Carbon Footprint includes CO2e emissions estimates for cloud
        compute, storage, networking and memory.
        <br />
        <br />
        Currently, for compute usage, we also factor in embodied emissions,
        which is the amount of carbon emitted during the creation and disposal
        of a hardware device. We provide more detail in our methodology linked
        below.
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
    </>
  )
}

const EmissionsSidePanel: FunctionComponent = () => {
  return (
    <SidePanel title="How do we get our carbon estimates?" drawerWidth={360}>
      <Methodology />
    </SidePanel>
  )
}

export default EmissionsSidePanel
