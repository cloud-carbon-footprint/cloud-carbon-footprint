/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent } from 'react'
import { IconButton, TextField } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import useStyles from './searchBarStyles'

type SearchBarProps = {
  value: string
  onChange: (string) => void
  clearSearch: () => void
}

const SearchBar: FunctionComponent<SearchBarProps> = ({
  value,
  onChange,
  clearSearch,
}) => {
  const { classes } = useStyles()
  return (
    <TextField
      data-testid="search-input"
      aria-label="search input"
      variant="outlined"
      className={classes.searchBar}
      placeholder="Search..."
      value={value}
      onChange={(event) => onChange(event.target.value)}
      InputProps={{
        startAdornment: <SearchIcon fontSize="small" />,
        endAdornment: (
          <IconButton
            title="Clear Search"
            aria-label="clear search"
            size="small"
            style={{ visibility: value ? 'visible' : 'hidden' }}
            onClick={clearSearch}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        ),
      }}
    />
  )
}

export default SearchBar
