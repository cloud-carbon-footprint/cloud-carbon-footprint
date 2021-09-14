/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import { Button, Tooltip as MaterialTooltip } from '@material-ui/core'

type TooltipProps = {
  message: string
}

const Tooltip: FunctionComponent<TooltipProps> = ({
  message,
}): ReactElement => {
  return (
    <MaterialTooltip title={message} data-testid="tooltip">
      <Button>?</Button>
    </MaterialTooltip>
  )
}

export default Tooltip
