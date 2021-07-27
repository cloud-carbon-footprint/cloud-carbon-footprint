/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  ErrorTypes,
  EstimationRequestValidationError,
  PartialDataError,
  RecommendationsRequestValidationError,
} from '../Errors'

describe('Errors', () => {
  it('is a partial data error', () => {
    const partialDataError = new PartialDataError('partial error message')

    expect(partialDataError.name).toEqual(ErrorTypes.PARTIAL_DATA_ERROR)
  })

  it('is an estimation request validation error ', () => {
    const estimationRequestError = new EstimationRequestValidationError(
      'estimation error message',
    )

    expect(estimationRequestError.name).toEqual(
      ErrorTypes.ESTIMATION_REQUEST_VALIDATION_ERROR,
    )
  })

  it('is a recommendations request validation error ', () => {
    const recommendationRequestError =
      new RecommendationsRequestValidationError('recommendation serror message')

    expect(recommendationRequestError.name).toEqual(
      ErrorTypes.RECOMMENDATIONS_REQUEST_VALIDATION_ERROR,
    )
  })
})
