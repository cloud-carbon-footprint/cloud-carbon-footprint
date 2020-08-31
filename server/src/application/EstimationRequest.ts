import moment from 'moment'
import { values, contains } from 'ramda'
import { CURRENT_REGIONS } from '@application/Config.json'
import { RawRequest } from '@view/RawRequest'

export interface EstimationRequest {
  startDate: Date
  endDate: Date
  region?: string
  //cloudProvider?:CloudProviderEnum
}

export class EstimationRequestValidationError extends Error {
  constructor(...params: any) {
    super(...params)
    this.name = 'EstimationRequestValidationError'
    Object.setPrototypeOf(this, EstimationRequestValidationError.prototype)
  }
}

// eslint-disable-next-line
// @ts-ignore
moment.suppressDeprecationWarnings = true

export function validate(request: RawRequest): EstimationRequest {
  const startDate = moment.utc(request.startDate)
  const endDate = moment.utc(request.endDate)

  const errors = []
  if (!request.startDate) {
    errors.push('Start date must be provided')
  } else if (!startDate.isValid()) {
    errors.push('Start date is not in a recognized RFC2822 or ISO format')
  }

  if (!request.endDate) {
    errors.push('End date must be provided')
  } else if (!endDate.isValid()) {
    errors.push('End date is not in a recognized RFC2822 or ISO format')
  }

  if (request.region && !contains(request.region, values(CURRENT_REGIONS))) {
    errors.push('Not a valid region for this account')
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

  // subtract mutates the original object so the order matters :(
  if (startDate.isBefore(now.subtract(12, 'months'))) {
    errors.push('Start date cannot be more than 12 months ago')
  }

  if (errors.length > 0) {
    throw new EstimationRequestValidationError(errors.join(', '))
  }

  return {
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
    region: request.region,
  }
}
