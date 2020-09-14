import React, { FunctionComponent } from 'react'
import { useFilterStyles } from '../../styles'
import Autocomplete, { AutocompleteRenderOptionState } from '@material-ui/lab/Autocomplete'
import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import TextField from '@material-ui/core/TextField'

export interface DropdownOption {
  key: string
  name: string
}

interface DropdownFilterProps {
  id: string
  displayValue: string
  options: DropdownOption[]
  selections: string[]
  selectionToOption: (selection: string) => DropdownOption
  updateSelections: (selections: string[]) => void
}

const DropdownFilter: FunctionComponent<DropdownFilterProps> = (props) => {
  const classes = useFilterStyles()

  return (
    <Autocomplete
      id={props.id}
      multiple
      disableCloseOnSelect
      disableClearable
      disablePortal
      size={'small'}
      options={props.options}
      value={props.selections.map(props.selectionToOption)}
      onChange={(_, selections) => {
        props.updateSelections(selections.map((s) => s.key))
      }}
      getOptionLabel={(option: DropdownOption) => option.name}
      getOptionSelected={(option: DropdownOption, value: DropdownOption) => option.key === value.key}
      renderOption={(option: DropdownOption, state: AutocompleteRenderOptionState) => (
        <React.Fragment>
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            inputProps={{ role: `checkbox-${option.key}` }}
            checked={state.selected}
          />
          {option.name}
        </React.Fragment>
      )}
      renderTags={() => null}
      className={classes.filterWidth}
      renderInput={(params: any) => {
        return (
          <TextField
            variant="outlined"
            label="AWS Services"
            {...params}
            InputProps={{
              ...params.InputProps,
              startAdornment: props.displayValue,
            }}
          />
        )
      }}
    />
  )
}

export default DropdownFilter
