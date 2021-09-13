/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  checkbox: {
    marginRight: theme.spacing(1),
  },
  inputLabel: {
    textTransform: 'none',
  },
  textField: {
    backgroundColor: theme.palette.background.paper,
    overflow: 'none',
    borderRadius: theme.shape.borderRadius,
    height: theme.spacing(5),
  },
}))

export default useStyles
