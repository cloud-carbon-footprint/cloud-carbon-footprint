import React, { Dispatch, FunctionComponent, SetStateAction } from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import Autocomplete, { AutocompleteRenderOptionState } from '@material-ui/lab/Autocomplete'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { SERVICE_OPTIONS, SERVICE_LABELS, ServiceOption } from './services'
import { Filters } from './hooks/Filters'
import { useFilterStyles } from './styles'

const ServiceFilter: FunctionComponent<ServiceFilterProps> = ({ filters, setFilters }) => {
  const classes = useFilterStyles()

  return (
    <Autocomplete
      id="services-filter"
      multiple
      disableCloseOnSelect
      disableClearable
      disablePortal
      size={'small'}
      options={SERVICE_OPTIONS}
      value={filters.services.map((service: string) => ({
        key: service,
        name: SERVICE_LABELS[service],
      }))}
      onChange={(_, selections) => {
        setFilters(filters.withServices(selections.map((s) => s.key)))
      }}
      getOptionLabel={(option: ServiceOption) => option.name}
      getOptionSelected={(option: ServiceOption, value: ServiceOption) => option.key === value.key}
      renderOption={(option: ServiceOption, state: AutocompleteRenderOptionState) => (
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
              startAdornment: filters.serviceLabel(),
            }}
          />
        )
      }}
    />
  )
}

type ServiceFilterProps = {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
}

export default ServiceFilter
