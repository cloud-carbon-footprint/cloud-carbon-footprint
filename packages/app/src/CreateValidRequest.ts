/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { includes, values } from 'ramda'
import {
  AWS_DEFAULT_RECOMMENDATION_TARGET,
  AWS_RECOMMENDATIONS_TARGETS,
  configLoader,
  EstimationRequestValidationError,
  GroupBy,
  RecommendationsRequestValidationError,
} from '@cloud-carbon-footprint/common'
import {
  FootprintEstimatesRawRequest,
  RecommendationsRawRequest,
  Tags,
} from './RawRequest'

export interface EstimationRequest {
  startDate: Date
  endDate: Date
  region?: string // Deprecated param (used only for the unsupported Higher Accuracy Approach)
  cloudProviderToSeed?: string // Used only for seeding cache file with MongoDB
  ignoreCache: boolean
  groupBy?: string
  limit?: number
  skip?: number
  cloudProviders?: string[]
  accounts?: string[]
  services?: string[]
  regions?: string[]
  tags?: Tags
}

export interface RecommendationRequest {
  awsRecommendationTarget?: AWS_RECOMMENDATIONS_TARGETS
}

interface FormattedEstimationRequest {
  startDate: moment.Moment
  endDate: moment.Moment
  region?: string
  cloudProviderToSeed?: string
  groupBy?: string
  limit?: string
  skip?: string
  cloudProviders?: string[]
  accounts?: string[]
  services?: string[]
  regions?: string[]
  tags?: Tags
}

// eslint-disable-next-line
// @ts-ignore
moment.suppressDeprecationWarnings = true

const validate = (
  request: FormattedEstimationRequest,
): void | EstimationRequestValidationError => {
  const errors = []
  const {
    startDate,
    endDate,
    region,
    cloudProviderToSeed,
    groupBy,
    limit,
    skip,
    cloudProviders,
    accounts,
    services,
    regions,
    tags,
  } = request

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

  if (limit) {
    const limitVal = parseInt(limit)
    if (isNaN(limitVal) || limitVal < 0) {
      errors.push('Not a valid limit number')
    }
  }

  if (skip) {
    const skipVal = parseInt(skip)
    if (isNaN(skipVal) || skipVal < 0) {
      errors.push('Not a valid skip number')
    }
  }

  if (cloudProviderToSeed) {
    const supportedCloudProviders = ['AWS', 'GCP', 'AZURE']
    if (
      typeof cloudProviderToSeed != 'string' ||
      !supportedCloudProviders.includes(cloudProviderToSeed.toUpperCase())
    ) {
      errors.push('Not a valid cloud provider to seed')
    }
  }

  const filters: { [key: string]: string[] } = {
    'cloud providers': cloudProviders,
    accounts,
    services,
    regions,
  }
  const filterValidators: { [char: string]: RegExp } = {
    'cloud providers': /^[A-Z]+$/, // only capital letters
    accounts: /^[A-Za-z0-9_-]*$/, // letters, numbers, and dashes/underscores
    services: /^[A-Za-z0-9\s]*$/, // letters. numbers and spaces
    regions: /^[A-Za-z0-9-]*$/, // letters, numbers, and dashes
  }

  for (const filter in filters) {
    const filterValues: string[] = filters[filter]
    const validator = filterValidators[filter]
    if (filterValues) {
      const errorMsg = `Filter for ${filter} must be an array with appropriate values`
      if (!filterValues.length) {
        errors.push(errorMsg)
      } else {
        for (const value of filterValues) {
          if (!value?.match(validator)) {
            errors.push(errorMsg)
            break
          }
        }
      }
    }
  }

  if (tags) {
    const tagError = `Tags must be formatted correctly into key/value pairs`
    if (typeof tags !== 'object') {
      errors.push(tagError)
    } else {
      for (const tag in tags) {
        if (typeof tags[tag] !== 'string') {
          errors.push(tagError)
          break
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new EstimationRequestValidationError(errors.join(', '))
  }
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

/**
 * Formats provided filter params of request into required string array for validation
 * @param request - The formatted request object
 */
const formatFilterParams = (
  request: FormattedEstimationRequest,
): FormattedEstimationRequest => {
  const filters = ['cloudProviders', 'accounts', 'services', 'regions']
  let formattedRequest = { ...request }
  filters.forEach((filterParam) => {
    const paramKey = filterParam as keyof FormattedEstimationRequest
    if (request[paramKey]) {
      const paramValue = request[paramKey]
      let filterArray = Array.isArray(paramValue)
        ? (paramValue as string[])
        : [paramValue]
      if (filterParam === 'cloudProviders') {
        filterArray = filterArray.map(
          (provider: string) => provider.toUpperCase?.(), // Capitalize valid strings (pre-validation)
        )
      }
      // Spread assignment to avoid type error
      formattedRequest = { ...formattedRequest, [paramKey]: filterArray }
    }
  })
  return formattedRequest
}

/**
 * Validates and properly formats each parameter value in the given footprint request
 * @param request - raw request of strings to be passed from the api
 * @throws EstimationRequestValidationError -  if any validation fails
 */
export const createValidFootprintRequest = (
  request: FootprintEstimatesRawRequest,
): EstimationRequest => {
  validateDatesPresent(request.startDate, request.endDate)

  const startDate = moment.utc(request.startDate)
  const endDate = moment.utc(request.endDate)

  let formattedRequest: FormattedEstimationRequest = {
    ...request,
    startDate,
    endDate,
  }

  let limit, skip
  if (request.limit) limit = parseInt(request.limit)
  if (request.skip) skip = parseInt(request.skip)

  formattedRequest = formatFilterParams(formattedRequest)

  validate(formattedRequest)

  return {
    ...formattedRequest,
    limit,
    skip,
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
    ignoreCache: request.ignoreCache === 'true',
  }
}

export const createValidRecommendationsRequest = (
  request: RecommendationsRawRequest,
): RecommendationRequest => {
  validateRecommendationTarget(request.awsRecommendationTarget)
  return rawRequestToRecommendationsRequest(request)
}
