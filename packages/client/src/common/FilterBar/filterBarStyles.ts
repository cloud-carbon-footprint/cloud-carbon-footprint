/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const PADDING_FILTER = 0.5

const useStyles = makeStyles((theme) => ({
  filterHeader: {
    top: 0,
    position: 'sticky', //make filter bar stick to top of container instead of page
    marginTop: '0px',
    width: '100%',
    backgroundColor: '#fff',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    zIndex: 1199,
    padding: '9px 10px 7px 10px',
  },
  filterContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  filterContainerSection: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  filter: {
    resize: 'none',
    padding: '2px 4px 0 4px',
    marginRight: theme.spacing(PADDING_FILTER),
    minWidth: '240px',
  },
}))

export default useStyles
