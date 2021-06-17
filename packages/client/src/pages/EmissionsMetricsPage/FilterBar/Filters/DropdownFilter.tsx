/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { FunctionComponent } from 'react'
import Autocomplete, {
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
} from '@material-ui/lab/Autocomplete'
import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import TextField from '@material-ui/core/TextField'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { toUpper } from 'ramda'

export interface DropdownOption {
  key: string
  name: string
  cloudProvider?: string
}

interface DropdownFilterProps {
  id: string
  displayValue: string
  options: DropdownOption[]
  selections: DropdownOption[]
  selectionToOption: (selection: DropdownOption) => DropdownOption
  updateSelections: (selections: (string | DropdownOption)[]) => void
}

const useStyles = makeStyles((theme) => ({
  checkbox: {
    marginRight: theme.spacing(1),
  },
  inputLabel: {
    textTransform: 'none',
  },
  textField: {
    backgroundColor: theme.palette.background.paper,
    overflow: 'none',
    borderRadius: theme.shape.borderRadius,
    height: theme.spacing(5),
  },
}))

function getLabelOfGroupByCloudProviders(
  cloudProvider: string,
  selections: DropdownOption[],
  options: DropdownOption[],
): string {
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

const DropdownFilter: FunctionComponent<DropdownFilterProps> = (props) => {
  const localClasses = useStyles()

  return (
    <Autocomplete
      id={props.id}
      multiple
      disableCloseOnSelect
      disableClearable
      disablePortal
      size={'small'}
      options={props.options}
      groupBy={(option) =>
        option.cloudProvider
          ? getLabelOfGroupByCloudProviders(
              option.cloudProvider,
              props.selections,
              props.options,
            )
          : ''
      }
      value={props.selections.map(props.selectionToOption)}
      onChange={(_, selections) => {
        props.updateSelections(selections)
      }}
      getOptionLabel={(option: DropdownOption) => option.name}
      getOptionSelected={(option: DropdownOption, value: DropdownOption) =>
        option.key === value.key
      }
      renderOption={(
        option: DropdownOption,
        state: AutocompleteRenderOptionState,
      ) => (
        <React.Fragment>
          <Checkbox
            color="primary"
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            className={localClasses.checkbox}
            inputProps={{ role: `checkbox-${option.key}` }}
            checked={state.selected}
          />
          {option.name}
        </React.Fragment>
      )}
      renderTags={() => null}
      renderInput={(params: AutocompleteRenderInputParams) => {
        return (
          <TextField
            className={localClasses.textField}
            variant="outlined"
            {...params}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <Typography
                  variant={'button'}
                  align={'center'}
                  className={localClasses.inputLabel}
                >
                  {props.displayValue}
                </Typography>
              ),
            }}
          />
        )
      }}
    />
  )
}

export default DropdownFilter
