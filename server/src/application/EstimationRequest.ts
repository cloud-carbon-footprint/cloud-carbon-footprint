import moment from 'moment'
import { regions } from '@services/AWSRegions'

export interface RawRequest {
  startDate?: string
  endDate?: string
  region?: string
}

export interface EstimationRequest {
  startDate: Date
  endDate: Date
  region: string
  //cloudProvider?:CloudProviderEnum
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

  if (!request.region) {
    errors.push('Region must be provided')
  } else if (!regions.includes(request.region)) {
    errors.push('Not a valid region')
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
    throw new Error(errors.join(', '))
  }

  return {
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
    region: request.region,
  }
}
