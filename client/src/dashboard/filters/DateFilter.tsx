import React, { FunctionComponent, useState } from 'react'
import { DateRangePicker } from 'react-dates'
import moment from 'moment'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import { DateRange, FilterProps } from './Filters'

const DateFilter: FunctionComponent<FilterProps> = ({ filters, setFilters }) => {
  const aYearAgo = moment.utc().subtract(12, 'M')
  const today = moment.utc()
  const startDate = filters.dateRange?.startDate || null
  const endDate = filters.dateRange?.endDate || null
  const [focusedInput, setFocusedInput] = useState<'startDate' | 'endDate' | null>(null)

  return (
    <DateRangePicker
      minDate={aYearAgo}
      maxDate={today}
      initialVisibleMonth={() => {
        if (startDate && focusedInput === 'startDate') {
          return startDate
        } else if (endDate && focusedInput === 'endDate') {
          return endDate.clone().subtract(1, 'M')
        }
        return today.clone().subtract(1, 'M')
      }}
      isOutsideRange={isOutsideRange(aYearAgo, today)}
      startDate={startDate} // momentPropTypes.momentObj or null,
      startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
      endDate={endDate} // momentPropTypes.momentObj or null,
      endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
      onDatesChange={({ startDate, endDate }) => {
        setFilters(filters.withDateRange(new DateRange(startDate, endDate)))
      }} // PropTypes.func.isRequired,
      focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
      onFocusChange={(focusedInput) => {
        setFocusedInput(focusedInput)
      }} // PropTypes.func.isRequired,
    />
  )
}

const isOutsideRange = (start: moment.Moment, end: moment.Moment) => (current: moment.Moment) => {
  return !current.isBetween(start, end, 'day', '[]')
}

export default DateFilter
