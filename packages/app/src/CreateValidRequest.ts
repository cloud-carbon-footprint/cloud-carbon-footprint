/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { values, contains } from 'ramda'
import {
  configLoader,
  EstimationRequestValidationError,
} from '@cloud-carbon-footprint/common'
import { RawRequest } from './RawRequest'

export interface EstimationRequest {
  startDate: Date
  endDate: Date
  region?: string
  //cloudProvider?:CloudProviderEnum
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

  if (region && !contains(region, values(configLoader().AWS.CURRENT_REGIONS))) {
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

function validateDatesPresent(
  startDate: string,
  endDate: string,
): void | EstimationRequestValidationError {
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
export default function CreateValidRequest(
  request: RawRequest,
): EstimationRequest {
  validateDatesPresent(request.startDate, request.endDate)

  const startDate = moment.utc(request.startDate)
  const endDate = moment.utc(request.endDate)

  validate(startDate, endDate, request.region)
  return rawRequestToEstimationRequest(request)
}
