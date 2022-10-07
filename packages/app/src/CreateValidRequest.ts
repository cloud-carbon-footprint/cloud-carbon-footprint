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
} from './RawRequest'

export interface EstimationRequest {
  startDate: Date
  endDate: Date
  region?: string
  ignoreCache: boolean
  groupBy?: string
  limit?: number | string
  skip?: number | string
  cloudProviders?: string[]
  accounts?: string[]
  services?: string[]
  regions?: string[]
  tags?: { [key: string]: string[] }
}

export interface RecommendationRequest {
  awsRecommendationTarget?: AWS_RECOMMENDATIONS_TARGETS
}

interface FormattedEstimationRequest {
  startDate: moment.Moment
  endDate: moment.Moment
  region?: string
  groupBy?: string
  limit?: number | string
  skip?: number | string
  cloudProviders?: string[]
  accounts?: string[]
  services?: string[]
  regions?: string[]
  tags?: { [key: string]: string[] }
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

  if (limit !== undefined && (isNaN(limit as number) || limit < 0)) {
    errors.push('Not a valid limit number')
  }

  if (skip !== undefined && (isNaN(skip as number) || skip < 0)) {
    errors.push('Not a valid skip number')
  }

  const filters: { [key: string]: string[] } = {
    'cloud providers': cloudProviders,
    accounts,
    services,
    regions,
  }
  const filterValidators: { [char: string]: RegExp } = {
    'cloud providers': /^[A-Za-z]+$/, // only letters
    accounts: /^[A-Za-z0-9_-]*$/, // letters, numbers, and dashes/underscores
    services: /^[a-zA-Z\s]*$/, // letters and spaces
    regions: /^[A-Za-z0-9-]*$/, // letters, numbers, and dashes
  }

  for (const filter in filters) {
    const filterValues: string[] = filters[filter]
    const validator = filterValidators[filter]
    if (filterValues && filterValues.length) {
      for (const value of filterValues) {
        if (!value.match(validator)) {
          errors.push(
            `Filter for ${filter} must be an array with appropriate values`,
          )
          break
        }
      }
    }
  }

  // TODO: Create more specific validation/input
  if (tags) {
    const tagError = `Tags must be formatted correctly as an array with a key and value pairs`
    if (!Array.isArray(tags)) {
      errors.push(tagError)
    } else {
      for (const [key, value] of Object.entries(tags)) {
        const keyExists = key !== '0'
        const isArray = Array.isArray(value)

        if (!keyExists || !isArray) {
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
 * Formats comma separated filter param into an array with whitespace removed
 * @param filterParam - filter string from api request
 * @returns             array if param string is present or undefined
 */
const filterParamToArray = (filterParam: string): string[] | undefined => {
  if (filterParam !== undefined) {
    return filterParam.replace(' ', '').split(',')
  }
  return undefined
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
  const limit =
    request.limit === undefined ? request.limit : parseInt(request.limit)
  const skip =
    request.skip === undefined ? request.skip : parseInt(request.skip)
  // TODO: Format filter values into array, trim potential whitespace, validate using regex to check for comma separated strings/numbers (no symbols)

  const cloudProviders = filterParamToArray(request.cloudProviders)
  const accounts = filterParamToArray(request.accounts)
  const services = filterParamToArray(request.services)
  const regions = filterParamToArray(request.regions)
  const tags = request.tags ? JSON.parse(request.tags) : request.tags

  const formattedRequest: FormattedEstimationRequest = {
    startDate,
    endDate,
    region: request.region,
    groupBy: request.groupBy,
    limit,
    skip,
    cloudProviders,
    accounts,
    services,
    regions,
    tags,
  }

  validate(formattedRequest)

  return {
    ...formattedRequest,
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
