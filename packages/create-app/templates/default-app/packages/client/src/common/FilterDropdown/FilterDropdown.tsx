/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import { toUpper } from 'ramda'
import Autocomplete, {
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
} from '@material-ui/lab/Autocomplete'
import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { TextField, Typography } from '@material-ui/core'
import { DropdownOption } from 'Types'
import useStyles from './filterDropdownStyles'

interface FilterDropdownProps {
  id: string
  displayValue: string
  options: DropdownOption[]
  selections: DropdownOption[]
  selectionToOption: (selection: DropdownOption) => DropdownOption
  updateSelections: (selections: (string | DropdownOption)[]) => void
}

const FilterDropdown: FunctionComponent<FilterDropdownProps> = (props) => {
  const classes = useStyles()

  const getLabelOfGroupByCloudProviders = (
    cloudProvider: string,
    selections: DropdownOption[],
    options: DropdownOption[],
  ): string => {
    let totalSelections = 0
    let totalOptions = 0
    selections.forEach((selection) => {
      selection.cloudProvider === cloudProvider && totalSelections++
    })
    options.forEach((option) => {
      option.cloudProvider === cloudProvider && totalOptions++
    })
    return `${toUpper(cloudProvider)}: ${totalSelections} of ${totalOptions}`
  }

  const groupByOption = (option) =>
    option.cloudProvider
      ? getLabelOfGroupByCloudProviders(
          option.cloudProvider,
          props.selections,
          props.options,
        )
      : ''

  const renderOption = (
    option: DropdownOption,
    state: AutocompleteRenderOptionState,
  ) => (
    <>
      <Checkbox
        color="primary"
        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
        checkedIcon={<CheckBoxIcon fontSize="small" />}
        className={classes.checkbox}
        inputProps={{ role: `checkbox-${option.key}` }}
        checked={state.selected}
      />
      {option.name}
    </>
  )

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <TextField
      className={classes.textField}
      variant="outlined"
      {...params}
      InputProps={{
        ...params.InputProps,
        startAdornment: (
          <Typography
            variant={'button'}
            align={'center'}
            className={classes.inputLabel}
          >
            {props.displayValue}
          </Typography>
        ),
      }}
    />
  )

  return (
    <Autocomplete
      id={props.id}
      multiple
      disableCloseOnSelect
      disableClearable
      disablePortal
      size="small"
      options={props.options}
      groupBy={groupByOption}
      value={props.selections.map(props.selectionToOption)}
      onChange={(_, selections) => {
        props.updateSelections(selections)
      }}
      getOptionLabel={(option: DropdownOption) => option.name}
      getOptionSelected={(option: DropdownOption, value: DropdownOption) =>
        option.key === value.key
      }
      renderOption={renderOption}
      renderTags={() => null}
      renderInput={renderInput}
    />
  )
}

export default FilterDropdown
