/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme) => ({
  buttonGroup: {
    height: theme.spacing(5),
    backgroundColor: theme.palette.background.paper,
  },
  button: {
    transition: 'color 1s',
  },
}))

export default useStyles
