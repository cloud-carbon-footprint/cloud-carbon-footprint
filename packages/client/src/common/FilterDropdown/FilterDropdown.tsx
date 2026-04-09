/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { toUpper } from 'ramda'
import Autocomplete, {
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete'
import { Checkbox, TextField, Typography } from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { DropdownOption } from '../../Types'
import useStyles from './filterDropdownStyles'

interface FilterDropdownProps {
  id: string
  displayValue: string
  options: DropdownOption[]
  selections: DropdownOption[]
  selectionToOption: (selection: DropdownOption) => DropdownOption
  updateSelections: (selections: (string | DropdownOption)[]) => void
}

const uncheckedIcon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const FilterDropdown: FunctionComponent<FilterDropdownProps> = (props) => {
  const { classes } = useStyles()

  const groupLabelMap = useMemo(() => {
    const selectionCounts = new Map<string, number>()
    const optionCounts = new Map<string, number>()

    props.selections.forEach((s) => {
      if (s.cloudProvider) {
        selectionCounts.set(
          s.cloudProvider,
          (selectionCounts.get(s.cloudProvider) || 0) + 1,
        )
      }
    })
    props.options.forEach((o) => {
      if (o.cloudProvider) {
        optionCounts.set(
          o.cloudProvider,
          (optionCounts.get(o.cloudProvider) || 0) + 1,
        )
      }
    })

    const labels = new Map<string, string>()
    optionCounts.forEach((total, cp) => {
      const selected = selectionCounts.get(cp) || 0
      labels.set(cp, `${toUpper(cp)}: ${selected} of ${total}`)
    })
    return labels
  }, [props.selections, props.options])

  const groupByOption = useCallback(
    (option: DropdownOption) =>
      option.cloudProvider ? groupLabelMap.get(option.cloudProvider) || '' : '',
    [groupLabelMap],
  )

  const renderOption = useCallback(
    (
      liProps: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key },
      option: DropdownOption,
      state: AutocompleteRenderOptionState,
    ) => {
      const { key, ...rest } = liProps
      return (
        <li key={key} {...rest}>
          <Checkbox
            color="primary"
            icon={uncheckedIcon}
            checkedIcon={checkedIcon}
            className={classes.checkbox}
            inputProps={{ role: `checkbox-${option.key}` }}
            checked={state.selected}
          />
          {option.name}
        </li>
      )
    },
    [classes.checkbox],
  )

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
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
    ),
    [classes.textField, classes.inputLabel, props.displayValue],
  )

  const value = useMemo(
    () => props.selections.map(props.selectionToOption),
    [props.selections, props.selectionToOption],
  )

  const handleChange = useCallback(
    (_: unknown, selections: (string | DropdownOption)[]) => {
      props.updateSelections(selections)
    },
    [props.updateSelections],
  )

  const getOptionLabel = useCallback(
    (option: DropdownOption) => option.name,
    [],
  )

  const isOptionEqualToValue = useCallback(
    (option: DropdownOption, val: DropdownOption) => option.key === val.key,
    [],
  )

  const renderTags = useCallback(() => null, [])

  return (
    <Autocomplete
      id={props.id}
      classes={{ listbox: classes.listBox }}
      multiple
      disableCloseOnSelect
      disableClearable
      disablePortal
      size="small"
      options={props.options}
      groupBy={groupByOption}
      value={value}
      onChange={handleChange}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      renderOption={renderOption}
      renderTags={renderTags}
      renderInput={renderInput}
    />
  )
}

export default React.memo(FilterDropdown)
