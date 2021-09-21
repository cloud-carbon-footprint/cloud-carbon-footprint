/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  searchBar: {
    minWidth: '50%',
    // Nested selector for child input element
    '& $input': {
      padding: 10,
    },
  },
}))

export default useStyles
