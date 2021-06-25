/*
 * © 2021 ThoughtWorks, Inc.
 */

import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles(() => {
  return {
    paginationContainer: {
      paddingTop: '10px',
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    paginationLabel: {
      color: '#ababab',
      fontWeight: 700,
      marginRight: '8px',
    },
  }
})

export default useStyles
