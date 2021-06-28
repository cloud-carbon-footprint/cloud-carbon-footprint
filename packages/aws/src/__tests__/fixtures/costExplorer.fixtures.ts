import { GetRightsizingRecommendationResponse } from 'aws-sdk/clients/costexplorer'

export const rightsizingRecommendationTerminate: GetRightsizingRecommendationResponse =
  {
    RightsizingRecommendations: [
      {
        AccountId: 'test-account',
        CurrentInstance: {
          InstanceName: 'Test instance',
          ResourceDetails: {
            EC2ResourceDetails: {
              InstanceType: 'm5zn.2xlarge',
              Region: 'US East (Ohio)',
            },
          },
        },
        RightsizingType: 'Terminate',
        TerminateRecommendationDetail: {
          EstimatedMonthlySavings: '20',
        },
      },
    ],
  }
