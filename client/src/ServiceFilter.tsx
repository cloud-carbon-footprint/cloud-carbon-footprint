import React, { Dispatch, FunctionComponent, SetStateAction } from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import Autocomplete, { AutocompleteGetTagProps, AutocompleteRenderOptionState } from '@material-ui/lab/Autocomplete'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { serviceLabels, ServiceOption, SERVICE_OPTIONS, NUM_SERVICES } from './services'
import { Filters } from './hooks/Filters'
import { useFilterStyles } from './styles'

const ServiceFilter: FunctionComponent<ServiceFilterProps> = ({ filters, setFilters }) => {
  const classes = useFilterStyles()
  const displayNumSelected = (numSelected: number) =>
    `Services: ${filters.allServicesSelected() ? NUM_SERVICES : numSelected} of ${NUM_SERVICES}`

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
        name: serviceLabels[service],
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
            checked={filters.allServicesSelected() || state.selected}
          />
          {option.name}
        </React.Fragment>
      )}
      renderTags={(value: ServiceOption[], getTagProps: AutocompleteGetTagProps) => displayNumSelected(value.length)}
      className={classes.filterWidth}
      renderInput={(params: any) => {
        return (
          <TextField
            variant="outlined"
            label="AWS Services"
            {...params}
            InputProps={
              filters.noServicesSelected()
                ? { ...params.InputProps, startAdornment: displayNumSelected(0) }
                : params.InputProps
            }
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
