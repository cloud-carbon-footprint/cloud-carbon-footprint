/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ChangeEvent, FunctionComponent, ReactElement } from 'react'
import { FormControl, MenuItem, Select } from '@material-ui/core'
import BootstrapInput from './selectDropdownStyles'

type SelectDropdownProps = {
  id?: string
  value: string
  dropdownOptions: string[]
  handleChange: (event: ChangeEvent<{ value: unknown }>) => void
}

const SelectDropdown: FunctionComponent<SelectDropdownProps> = ({
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
