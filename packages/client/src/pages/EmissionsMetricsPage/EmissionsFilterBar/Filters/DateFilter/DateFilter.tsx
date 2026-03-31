/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import moment from 'moment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { FiltersDateRange } from '../../../../../common/FilterBar/utils/Filters'
import StyleWrapper from './dateFilterstyles'
import { FilterProps } from '../../../../../Types'

const DateFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
}) => {
  const today = moment.utc()
  const startOfLastYear = moment.utc(
    Date.UTC(today.year() - 1, 0, 1, 0, 0, 0, 0),
  )
  const startDate = filters.dateRange?.startDate || null
  const endDate = filters.dateRange?.endDate || null

  const handleStartChange = (newStart: moment.Moment | null) => {
    setFilters(filters.withDateRange(new FiltersDateRange(newStart, endDate)))
  }

  const handleEndChange = (newEnd: moment.Moment | null) => {
    setFilters(filters.withDateRange(new FiltersDateRange(startDate, newEnd)))
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <StyleWrapper direction="row" spacing={1} alignItems="center">
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={handleStartChange}
          minDate={startOfLastYear}
          maxDate={endDate ?? today}
          format="MM/DD/YYYY"
          slotProps={{
            textField: {
              size: 'small',
              placeholder: 'Start Date',
            },
          }}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={handleEndChange}
          minDate={startDate ?? startOfLastYear}
          maxDate={today}
          format="MM/DD/YYYY"
          slotProps={{
            textField: {
              size: 'small',
              placeholder: 'End Date',
            },
          }}
        />
      </StyleWrapper>
    </LocalizationProvider>
  )
}

export default DateFilter
