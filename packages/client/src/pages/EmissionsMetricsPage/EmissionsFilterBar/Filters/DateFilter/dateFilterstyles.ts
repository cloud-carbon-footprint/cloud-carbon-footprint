/*
 * © 2021 Thoughtworks, Inc.
 */

import { Stack, StackProps } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyleWrapper = styled(Stack)<StackProps>(({ theme }) => ({
  '& .MuiFormControl-root': {
    minWidth: theme.spacing(16),
  },
  '& .MuiInputBase-root': {
    height: theme.spacing(5),
  },
}))

export default StyleWrapper
