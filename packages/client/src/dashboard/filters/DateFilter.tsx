/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import React, { FunctionComponent, useState } from 'react'
import moment from 'moment'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import { DateRange, FilterProps } from './Filters'
import { DateRangePicker } from 'react-dates'
import { withTheme, Theme } from '@material-ui/core'
import styled from 'styled-components'

const StyledWrapper = withTheme(styled.div`
  ${({ theme }: { theme: Theme }) => `
    .DateRangePickerInput {
      border-radius: ${theme.shape.borderRadius}px;
      overflow: hidden;
      height: ${theme.spacing(5)}px;
      background-color: ${theme.palette.background.paper};
    }
    // https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/OutlinedInput/OutlinedInput.js#L10
    .DateRangePickerInput__withBorder {
      border: 1px solid ${
        theme.palette.type === 'light'
          ? 'rgba(0, 0, 0, 0.23)'
          : 'rgba(255, 255, 255, 0.23)'
      };
    }
    .DateInput {
      width: ${theme.spacing(13)}px;
    }
    .DateInput_input {
      color: ${theme.palette.primary.light};
      background-color: ${theme.palette.background.paper};
      font-weight: ${theme.typography.button.fontWeight};
      letter-spacing: ${theme.typography.button.letterSpacing};
      font-size: ${theme.typography.button.fontSize};
      line-height: 1;
      font-family: ${theme.typography.button.fontFamily};
      color: ${theme.palette.text.primary};
    }
    .DateInput_input__focused {
      border-bottom: 2px solid ${theme.palette.primary.main};
    }
    .DateRangePickerInput_arrow_svg {
      fill: ${theme.palette.action.active};
      background-color: ${theme.palette.background.paper};
    }
    .CalendarDay__default {
      background-color: ${theme.palette.background.paper};
      color: ${theme.palette.text.primary};
      border: 1px double ${theme.palette.grey[400]};
    }
    .CalendarDay__default:hover {
      background-color: ${theme.palette.action.focus};
    }
    .CalendarDay__blocked_out_of_range, .CalendarDay__blocked_out_of_range:hover {
      color: ${theme.palette.action.disabled};
      background-color: ${theme.palette.background.paper};
    }
    .CalendarDay__selected, .CalendarDay__selected:active, .CalendarDay__selected:hover {
      background: ${theme.palette.primary.main};
      border: 1px double ${theme.palette.grey[400]};
      color: ${theme.palette.common.white};
    }
    .CalendarDay__selected_span {
      background: ${theme.palette.primary.light};
      border: 1px double ${theme.palette.grey[400]};
      color: ${theme.palette.common.white};
    }
    .CalendarDay__hovered_span, .CalendarDay__hovered_span:hover {
      background: ${theme.palette.primary.light};
      border: 1px double ${theme.palette.grey[400]};
      color: ${theme.palette.common.white};
    }
    .CalendarMonthGrid {
      background-color: ${theme.palette.background.paper};
    }
    .CalendarMonth_caption {
      color: ${theme.palette.text.primary};
    }
    .CalendarMonthGrid_month__horizontal {
      background-color: ${theme.palette.background.paper};
    }
    .DayPicker {
      background-color: ${theme.palette.background.paper};
      border-radius: ${theme.shape.borderRadius}px;
      overflow: hidden;
    }
    .DateRangePicker_picker {
      background-color: ${theme.palette.background.paper};
      border-radius: ${theme.shape.borderRadius}px;
      border: 1px solid ${theme.palette.divider};
      overflow: hidden;
      top: ${theme.spacing(6)}px !important;
    }
    .DayPickerNavigation_svg__horizontal {
      fill: ${theme.palette.action.active};
    }
    .DayPickerNavigation_svg__disabled {
      fill: ${theme.palette.action.disabled};
    }
    .DayPickerNavigation_button__default {
      border: 1px solid ${theme.palette.action.active};
    }
    .DayPickerNavigation_button__disabled {
      border: 1px solid ${theme.palette.action.disabled};
    }
    .DayPickerNavigation_button__default {
      background-color: ${theme.palette.background.paper};
    }
    .CalendarMonth {
      background-color: ${theme.palette.background.paper};
    }
    .DayPickerKeyboardShortcuts_panel {
      background-color: ${theme.palette.background.paper};
    }
    .DayPickerKeyboardShortcuts_show__bottomRight::before {
      border-right: 33px solid ${theme.palette.primary.main}
    }
  `}
`)

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
  const [focusedInput, setFocusedInput] = useState<
    'startDate' | 'endDate' | null
  >(null)

  return (
    <StyledWrapper>
      <DateRangePicker
        withPortal={false}
        withFullScreenPortal={false}
        minDate={startOfLastYear}
        maxDate={today}
        initialVisibleMonth={() => {
          if (startDate && focusedInput === 'startDate') {
            return startDate
          } else if (endDate && focusedInput === 'endDate') {
            return endDate.clone().subtract(1, 'M')
          }
          return today.clone().subtract(1, 'M')
        }}
        isOutsideRange={isOutsideRange(startOfLastYear, today)}
        startDate={startDate}
        startDateId="startDate"
        endDate={endDate}
        endDateId="endDate"
        onDatesChange={({ startDate, endDate }) => {
          setFilters(filters.withDateRange(new DateRange(startDate, endDate)))
        }}
        focusedInput={focusedInput}
        onFocusChange={(focusedInput) => {
          setFocusedInput(focusedInput)
        }}
      />
    </StyledWrapper>
  )
}

const isOutsideRange = (start: moment.Moment, end: moment.Moment) => (
  current: moment.Moment,
) => {
  return !current.isBetween(start, end, 'day', '[]')
}

export default DateFilter
