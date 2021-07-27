/*
 * © 2021 Thoughtworks, Inc.
 */

export enum ErrorTypes {
  PARTIAL_DATA_ERROR = 'PartialDataError',
  ESTIMATION_REQUEST_VALIDATION_ERROR = 'EstimationRequestValidationError',
  RECOMMENDATIONS_REQUEST_VALIDATION_ERROR = 'RecommendationsRequestValidationError',
}

export class EstimationRequestValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorTypes.ESTIMATION_REQUEST_VALIDATION_ERROR
    Object.setPrototypeOf(this, EstimationRequestValidationError.prototype)
  }
}

export class RecommendationsRequestValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorTypes.RECOMMENDATIONS_REQUEST_VALIDATION_ERROR
    Object.setPrototypeOf(this, RecommendationsRequestValidationError.prototype)
  }
}

export class PartialDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorTypes.PARTIAL_DATA_ERROR
    Object.setPrototypeOf(this, PartialDataError.prototype)
  }
}
