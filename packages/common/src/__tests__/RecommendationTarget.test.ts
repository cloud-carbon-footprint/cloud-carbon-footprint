/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  AWS_DEFAULT_RECOMMENDATION_TARGET,
  AWS_RECOMMENDATIONS_TARGETS,
} from '../RecommendationTarget'

describe('Recommendation Target', () => {
  it('should return proper format for aws recommendation targets', () => {
    expect(AWS_RECOMMENDATIONS_TARGETS.SAME_INSTANCE_FAMILY).toBe(
      'SAME_INSTANCE_FAMILY',
    )
    expect(AWS_RECOMMENDATIONS_TARGETS.CROSS_INSTANCE_FAMILY).toBe(
      'CROSS_INSTANCE_FAMILY',
    )
  })

  it('should return the same instance family as the aws default', () => {
    expect(AWS_DEFAULT_RECOMMENDATION_TARGET).toBe('SAME_INSTANCE_FAMILY')
  })
})
