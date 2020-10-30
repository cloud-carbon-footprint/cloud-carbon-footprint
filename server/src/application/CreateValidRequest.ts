/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import moment from 'moment'
import { values, contains } from 'ramda'
import appConfig from '@application/Config'
import { RawRequest } from '@view/RawRequest'

export interface EstimationRequest {
  startDate: Date
  endDate: Date
  region?: string
  //cloudProvider?:CloudProviderEnum
}

export class EstimationRequestValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EstimationRequestValidationError'
    Object.setPrototypeOf(this, EstimationRequestValidationError.prototype)
  }
}

export class PartialDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PartialDataError'
    Object.setPrototypeOf(this, PartialDataError.prototype)
  }
}

// eslint-disable-next-line
// @ts-ignore
moment.suppressDeprecationWarnings = true

function validate(
  startDate: moment.Moment,
  endDate: moment.Moment,
  region?: string,
): void | EstimationRequestValidationError {
  const errors = []
  if (!startDate.isValid()) {
    errors.push('Start date is not in a recognized RFC2822 or ISO format')
  }

  if (!endDate.isValid()) {
    errors.push('End date is not in a recognized RFC2822 or ISO format')
  }

  if (region && !contains(region, values(appConfig.AWS.CURRENT_REGIONS))) {
    errors.push('Not a valid region for this account')
  }

  if (startDate.isSameOrAfter(endDate)) {
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
}

function rawRequestToEstimationRequest(request: RawRequest): EstimationRequest {
  return {
    startDate: moment.utc(request.startDate).toDate(),
    endDate: moment.utc(request.endDate).toDate(),
    region: request.region,
  }
}

function validateDatesPresent(startDate: string, endDate: string): void | EstimationRequestValidationError {
  const errors = []
  if (!startDate) {
    errors.push('Start date must be provided')
  }

  if (!endDate) {
    errors.push('End date must be provided')
  }

  if (errors.length > 0) {
    throw new EstimationRequestValidationError(errors.join(', '))
  }
}

// throws EstimationRequestValidationError if either validation fails
export default function CreateValidRequest(request: RawRequest): EstimationRequest {
  validateDatesPresent(request.startDate, request.endDate)

  const startDate = moment.utc(request.startDate)
  const endDate = moment.utc(request.endDate)

  validate(startDate, endDate, request.region)
  return rawRequestToEstimationRequest(request)
}
