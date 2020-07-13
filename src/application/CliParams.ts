import { EstimationRequest } from './EstimationRequest'
import moment = require('moment')

export interface RawRequest {
  startDate: string
  endDate: string
}

// eslint-disable-next-line
// @ts-ignore
moment.suppressDeprecationWarnings = true

export default function (program: RawRequest): EstimationRequest {
  const startDate = moment(program.startDate)
  const endDate = moment(program.endDate)

  const errors = []
  if (!startDate.isValid()) {
    errors.push('Start date is not in a recognized RFC2822 or ISO format')
  }

  if (!endDate.isValid()) {
    errors.push('End date is not in a recognized RFC2822 or ISO format')
  }

  if (startDate.isAfter(endDate)) {
    errors.push('Start date is not before end date')
  }

  const now = moment()
  if (startDate.isAfter(now)) {
    errors.push('Start date is in the future')
  }

  if (endDate.isAfter(now)) {
    errors.push('End date is in the future')
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '))
  }

  return {
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
  }
}
