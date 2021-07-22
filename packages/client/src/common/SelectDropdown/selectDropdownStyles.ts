/*
 * © 2021 Thoughtworks, Inc.
 */

import { createStyles, InputBase, withStyles } from '@material-ui/core'

const BootstrapInput = withStyles(() =>
  createStyles({
    input: {
      border: '1px solid #ced4da',
      fontSize: 16,
      padding: '10px 26px 10px 12px',
      width: '65px',
      '&:hover': {
        borderColor: 'black',
      },
      '&:focus': {
        backgroundColor: 'white',
        borderRadius: 4,
      },
    },
  }),
)(InputBase)

export default BootstrapInput
