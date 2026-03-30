/*
 * © 2021 Thoughtworks, Inc.
 */

import { styled } from '@mui/material/styles'
import { InputBase } from '@mui/material'

const BootstrapInput = styled(InputBase)(() => ({
  '& .MuiInputBase-input': {
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
}))

export default BootstrapInput
