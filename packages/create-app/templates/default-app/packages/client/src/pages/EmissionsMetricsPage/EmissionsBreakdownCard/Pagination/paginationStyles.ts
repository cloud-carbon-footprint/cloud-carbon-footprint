/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(({ palette }) => {
  return {
    paginationContainer: {
      paddingTop: '10px',
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    paginationLabel: {
      color: palette.grey.A200,
      fontWeight: 700,
      marginRight: '8px',
    },
  }
})

export default useStyles
