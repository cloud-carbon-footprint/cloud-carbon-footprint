/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { ChangeEvent, FunctionComponent, ReactElement } from 'react'
import {
  createStyles,
  FormControl,
  InputBase,
  MenuItem,
  Select,
  withStyles,
} from '@material-ui/core'

type SelectProps = {
  id?: string
  value: string
  dropdownOptions: string[]
  handleChange: (event: ChangeEvent<{ value: unknown }>) => void
}

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

const SelectDropdown: FunctionComponent<SelectProps> = ({
  id,
  value,
  dropdownOptions,
  handleChange,
}): ReactElement => (
  <FormControl variant="outlined">
    <Select
      data-testid="select"
      id={`${id}-selector`}
      value={value}
      onChange={handleChange}
      input={<BootstrapInput />}
    >
      {dropdownOptions.map((option) => (
        <MenuItem key={option} id={`${option}-dropdown`} value={option}>
          {/* Makes sure first letter of option is capitalized for display */}
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
)

export default SelectDropdown
