/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import { IconButton, Tooltip as MaterialTooltip } from '@material-ui/core'
import HelpIcon from '@material-ui/icons/Help'
import useStyles from './tooltipStyles'

type TooltipProps = {
  message: string
}

const Tooltip: FunctionComponent<TooltipProps> = ({
  message,
}): ReactElement => {
  const classes = useStyles()
  return (
    <MaterialTooltip
      title={message}
      data-testid="tooltip"
      className={classes.tooltip}
    >
      <IconButton className={classes.helpIcon}>
        <HelpIcon />
      </IconButton>
    </MaterialTooltip>
  )
}

export default Tooltip
