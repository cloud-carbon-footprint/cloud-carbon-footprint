/*
 * © 2021 ThoughtWorks, Inc.
 */

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
