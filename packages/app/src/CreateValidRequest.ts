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
  limit?: number
  skip?: number
  cloudProviders?: string[]
  accounts?: string[]
  services?: string[]
  regions?: string[]
  tags?: { [key: string]: string[] }
}

export interface RecommendationRequest {
  awsRecommendationTarget?: AWS_RECOMMENDATIONS_TARGETS
}

// eslint-disable-next-line
// @ts-ignore
moment.suppressDeprecationWarnings = true

const validate = (
  startDate: moment.Moment,
  endDate: moment.Moment,
  region?: string,
  groupBy?: string,
  limit?: string,
  skip?: string,
  cloudProviders?: string,
  accounts?: string,
  services?: string,
  regions?: string,
  tags?: string,
): void | EstimationRequestValidationError => {
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

  if (limit && (isNaN(limit as unknown as number) || parseInt(limit) < 0)) {
    errors.push('Not a valid limit number')
  }

  if (skip && (isNaN(skip as unknown as number) || parseInt(skip) < 0)) {
    errors.push('Not a valid skip number')
  }

  const filters = [cloudProviders, accounts, services, regions]
  filters.forEach((filter) => {
    if (filter && !Array.isArray(isJsonString(filter))) {
      errors.push(`Filter must be an array list`)
    }
  })

  const tagError = `Tags must be formatted correctly as an array with a key and value pairs`
  if (tags && !isJsonString(tags)) {
    errors.push(tagError)
  }
  for (const [key, value] of Object.entries(isJsonString(tags))) {
    const keyExists = key !== '0'
    const isArray = Array.isArray(value)

    if (!keyExists || !isArray) {
      errors.push(tagError)
      break
    }
  }

  if (errors.length > 0) {
    throw new EstimationRequestValidationError(errors.join(', '))
  }
}

const isJsonString = (string: string) => {
  try {
    JSON.parse(string)
  } catch (e) {
    return false
  }
  return JSON.parse(string)
}

const validateDatesPresent = (
  startDate: string,
  endDate: string,
): void | EstimationRequestValidationError => {
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

const validateRecommendationTarget = (
  awsRecommendationTarget: string,
): void | RecommendationsRequestValidationError => {
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

const rawRequestToEstimationRequest = (
  request: FootprintEstimatesRawRequest,
): EstimationRequest => {
  const estimationRequest: EstimationRequest = {
    startDate: moment.utc(request.startDate).toDate(),
    endDate: moment.utc(request.endDate).toDate(),
    ignoreCache: request.ignoreCache === 'true',
    groupBy: request.groupBy,
    region: request.region,
  }
  if (request.limit) estimationRequest['limit'] = parseInt(request.limit)
  if (request.skip) estimationRequest['skip'] = parseInt(request.skip)
  if (request.cloudProviders)
    estimationRequest['cloudProviders'] = JSON.parse(request.cloudProviders)
  if (request.accounts)
    estimationRequest['accounts'] = JSON.parse(request.accounts)
  if (request.services)
    estimationRequest['services'] = JSON.parse(request.services)
  if (request.regions)
    estimationRequest['regions'] = JSON.parse(request.regions)
  if (request.tags) estimationRequest['tags'] = JSON.parse(request.tags)

  return estimationRequest
}

// throws EstimationRequestValidationError if either validation fails
export const createValidFootprintRequest = (
  request: FootprintEstimatesRawRequest,
): EstimationRequest => {
  validateDatesPresent(request.startDate, request.endDate)

  const startDate = moment.utc(request.startDate)
  const endDate = moment.utc(request.endDate)

  validate(
    startDate,
    endDate,
    request.region,
    request.groupBy,
    request.limit,
    request.skip,
    request.cloudProviders,
    request.accounts,
    request.services,
    request.regions,
    request.tags,
  )
  return rawRequestToEstimationRequest(request)
}

const rawRequestToRecommendationsRequest = (
  request: RecommendationsRawRequest,
): RecommendationRequest => {
  const awsRecommendationTarget =
    (request.awsRecommendationTarget as AWS_RECOMMENDATIONS_TARGETS) ||
    AWS_DEFAULT_RECOMMENDATION_TARGET

  return {
    awsRecommendationTarget,
  }
}

export const createValidRecommendationsRequest = (
  request: RecommendationsRawRequest,
): RecommendationRequest => {
  validateRecommendationTarget(request.awsRecommendationTarget)
  return rawRequestToRecommendationsRequest(request)
}
