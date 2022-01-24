/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { values, includes } from 'ramda'
import {
  AWS_DEFAULT_RECOMMENDATION_TARGET,
  AWS_RECOMMENDATIONS_TARGETS,
  configLoader,
  EstimationRequestValidationError,
  RecommendationsRequestValidationError,
  GroupBy,
} from '@cloud-carbon-footprint/common'
import {
  FootprintEstimatesRawRequest,
  RecommendationsRawRequest,
} from './RawRequest'

export interface EstimationRequest {
  startDate: Date
  endDate: Date
  region?: string
  ignoreCache: boolean
  groupBy?: string
  //cloudProvider?:CloudProviderEnum
}

export interface RecommendationRequest {
  awsRecommendationTarget?: AWS_RECOMMENDATIONS_TARGETS
}

// eslint-disable-next-line
// @ts-ignore
moment.suppressDeprecationWarnings = true

function validate(
  startDate: moment.Moment,
  endDate: moment.Moment,
  region?: string,
  groupBy?: string,
): void | EstimationRequestValidationError {
  const errors = []
  if (!startDate.isValid()) {
    errors.push('Start date is not in a recognized RFC2822 or ISO format')
  }

  if (!endDate.isValid()) {
    errors.push('End date is not in a recognized RFC2822 or ISO format')
  }

  if (region && !includes(region, values(configLoader().AWS.CURRENT_REGIONS))) {
    errors.push('Not a valid region for this account')
  }

  if (startDate.isAfter(endDate)) {
    errors.push('Start date is after end date')
  }

  const now = moment()
  if (startDate.isAfter(now)) {
    errors.push('Start date is in the future')
  }

  if (endDate.isAfter(now)) {
    errors.push('End date is in the future')
  }

  if (groupBy && !Object.keys(GroupBy).includes(groupBy)) {
    errors.push('Please specify a valid groupBy period')
  }

  if (errors.length > 0) {
    throw new EstimationRequestValidationError(errors.join(', '))
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

function validateRecommendationTarget(
  awsRecommendationTarget: string,
): void | RecommendationsRequestValidationError {
  if (
    awsRecommendationTarget &&
    !Object.values(AWS_RECOMMENDATIONS_TARGETS).includes(
      awsRecommendationTarget as AWS_RECOMMENDATIONS_TARGETS,
    )
  ) {
    throw new RecommendationsRequestValidationError(
      'AWS Recommendation Target is not valid',
    )
  }
}

function rawRequestToEstimationRequest(
  request: FootprintEstimatesRawRequest,
): EstimationRequest {
  const ignoreCache = request.ignoreCache === 'true'
  const startMoment = moment.utc(request.startDate)
  const endMoment = moment.utc(request.endDate)
  const groupBy = request.groupBy as GroupBy

  return {
    startDate: startMoment.toDate(),
    endDate: endMoment.toDate(),
    region: request.region,
    ignoreCache,
    groupBy,
  }
}

// throws EstimationRequestValidationError if either validation fails
export function CreateValidFootprintRequest(
  request: FootprintEstimatesRawRequest,
): EstimationRequest {
  validateDatesPresent(request.startDate, request.endDate)

  const startDate = moment.utc(request.startDate)
  const endDate = moment.utc(request.endDate)

  validate(startDate, endDate, request.region, request.groupBy)
  return rawRequestToEstimationRequest(request)
}

function rawRequestToRecommendationsRequest(
  request: RecommendationsRawRequest,
): RecommendationRequest {
  const awsRecommendationTarget =
    (request.awsRecommendationTarget as AWS_RECOMMENDATIONS_TARGETS) ||
    AWS_DEFAULT_RECOMMENDATION_TARGET

  return {
    awsRecommendationTarget,
  }
}

export function CreateValidRecommendationsRequest(
  request: RecommendationsRawRequest,
): RecommendationRequest {
  validateRecommendationTarget(request.awsRecommendationTarget)
  return rawRequestToRecommendationsRequest(request)
}
