/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import {
  IconButton,
  Tooltip as MaterialTooltip,
  withStyles,
} from '@material-ui/core'
import HelpIcon from '@material-ui/icons/Help'
import useStyles from './tooltipStyles'

type TooltipProps = {
  message: string
}

const TextOnlyTooltip = withStyles({
  tooltip: {
    color: 'rgba(0, 0, 0, 0.87)',
    backgroundColor: 'white',
    border: 'solid 1px #E6E6E6',
    fontSize: 13,
    fontWeight: 'normal',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    boxShadow: '1px 1px 5px #E6E6E6',
    borderRadius: '5px',
  },
  arrow: {
    color: '#E6E6E6',
  },
})(MaterialTooltip)

const Tooltip: FunctionComponent<TooltipProps> = ({
  message,
}): ReactElement => {
  const classes = useStyles(MaterialTooltip)
  return (
    <TextOnlyTooltip
      placement={'right'}
      arrow={true}
      title={message}
      data-testid="tooltip"
      className={classes.tooltip}
    >
      <IconButton className={classes.helpIcon}>
        <HelpIcon />
      </IconButton>
    </TextOnlyTooltip>
  )
}

export default Tooltip
