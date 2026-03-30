/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import { IconButton, Tooltip as MaterialTooltip } from '@mui/material'
import HelpIcon from '@mui/icons-material/Help'
import useStyles, { TextOnlyTooltip } from './tooltipStyles'

type TooltipProps = {
  message: string
}

const Tooltip: FunctionComponent<TooltipProps> = ({
  message,
}): ReactElement => {
  const { classes } = useStyles()
  return (
    <TextOnlyTooltip
      data-testid="tooltip"
      placement="right"
      arrow={true}
      title={message}
      className={classes.tooltip}
    >
      <IconButton className={classes.helpIcon}>
        <HelpIcon />
      </IconButton>
    </TextOnlyTooltip>
  )
}

export default Tooltip
