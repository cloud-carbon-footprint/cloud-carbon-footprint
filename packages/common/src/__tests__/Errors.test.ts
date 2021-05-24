/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  ErrorTypes,
  EstimationRequestValidationError,
  PartialDataError,
} from '../Errors'

describe('Errors', () => {
  it('is a partial data error', () => {
    const partialDataError = new PartialDataError('partial error message')

    expect(partialDataError.name).toEqual(ErrorTypes.PARTIAL_DATA_ERROR)
  })

  it('is an estimation request validation errors ', () => {
    const partialDataError = new EstimationRequestValidationError(
      'estimation error message',
    )

    expect(partialDataError.name).toEqual(
      ErrorTypes.ESTIMATION_REQUEST_VALIDATION_ERROR,
    )
  })
})
