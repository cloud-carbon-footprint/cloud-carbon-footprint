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
              InstanceType: 'm5dn.24xlarge',
              Region: 'US East (Ohio)',
              Vcpu: '96',
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
