/*
 * © 2021 ThoughtWorks, Inc.
 */

import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => {
  return {
    paginationContainer: {
      paddingTop: '10px',
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    paginationLabel: {
      color: theme.palette.grey.A200,
      fontWeight: 700,
      marginRight: '8px',
    },
  }
})

export default useStyles
