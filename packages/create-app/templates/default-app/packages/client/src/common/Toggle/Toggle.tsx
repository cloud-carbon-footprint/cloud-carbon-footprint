/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import useStyles from './toggleStyles'
import { Typography } from '@material-ui/core'

type ToggleProps = {
  label?: string
  handleToggle: (boolean) => void
}

const Toggle: FunctionComponent<ToggleProps> = ({
  label,
  handleToggle,
}): ReactElement => {
  const classes = useStyles()
  return (
    <div className={classes.toggleWrapper}>
      {label && <Typography className={classes.label}>{label}</Typography>}
      <input
        onChange={(e) => handleToggle(e.target.checked)}
        className={classes.toggleInput}
        type="checkbox"
        id="toggle"
        data-testid="toggle"
      />
      <label
        className={classes.toggle}
        htmlFor="toggle"
        data-testid="toggle-label"
      >
        <span className={classes.toggleHandler} />
      </label>
    </div>
  )
}

export default Toggle
