/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme) => ({
  checkbox: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(-2),
  },
  inputLabel: {
    textTransform: 'none',
  },
  listBox: {
    overflowWrap: 'anywhere',
  },
  textField: {
    backgroundColor: theme.palette.background.paper,
    overflow: 'none',
    borderRadius: theme.shape.borderRadius,
    height: theme.spacing(5),
  },
}))

export default useStyles
