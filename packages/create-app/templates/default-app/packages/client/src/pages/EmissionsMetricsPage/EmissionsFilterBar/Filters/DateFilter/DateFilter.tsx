/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, useState } from 'react'
import moment from 'moment'
import { DateRangePicker } from 'react-dates'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import { FiltersDateRange } from '../../../../../common/FilterBar/utils/Filters'
import StyleWrapper from './dateFilterstyles'
import { FilterProps } from 'Types'

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
  const [focusedInput, setFocusedInput] =
    useState<'startDate' | 'endDate' | null>(null)

  const isOutsideRange =
    (start: moment.Moment, end: moment.Moment) => (current: moment.Moment) => {
      return !current.isBetween(start, end, 'day', '[]')
    }

  const initialVisibleMonth = () => {
    if (startDate && focusedInput === 'startDate') {
      return startDate
    } else if (endDate && focusedInput === 'endDate') {
      return endDate.clone().subtract(1, 'M')
    }
    return today.clone().subtract(1, 'M')
  }

  const handleDatesChange = ({ startDate, endDate }) => {
    setFilters(filters.withDateRange(new FiltersDateRange(startDate, endDate)))
  }

  const handleFocusChange = (focusedInput) => {
    setFocusedInput(focusedInput)
  }

  return (
    <StyleWrapper>
      <DateRangePicker
        withPortal={false}
        withFullScreenPortal={false}
        minDate={startOfLastYear}
        maxDate={today}
        initialVisibleMonth={initialVisibleMonth}
        isOutsideRange={isOutsideRange(startOfLastYear, today)}
        startDate={startDate}
        startDateId="startDate"
        endDate={endDate}
        endDateId="endDate"
        onDatesChange={handleDatesChange}
        focusedInput={focusedInput}
        onFocusChange={handleFocusChange}
      />
    </StyleWrapper>
  )
}

export default DateFilter
