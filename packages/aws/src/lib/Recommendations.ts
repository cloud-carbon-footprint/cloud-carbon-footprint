/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  ICloudRecommendationsService,
  ComputeEstimator,
  MemoryEstimator,
} from '@cloud-carbon-footprint/core'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { ServiceWrapper } from './ServiceWrapper'

export default class Recommendations implements ICloudRecommendationsService {
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly memoryEstimator: MemoryEstimator,
    private readonly serviceWrapper: ServiceWrapper,
  ) {}

  async getRecommendations(): Promise<RecommendationResult[]> {
    return [
      {
        cloudProvider: 'AWS',
        accountId: 'test-account',
        accountName: 'test-account',
        region: 'us-east-2',
        recommendationType: 'Terminate instance "Test instance"',
        recommendationDetail: 'test',
        kilowattHourSavings: 20,
        co2eSavings: 10,
        costSavings: 20,
      },
    ]
  }
}
