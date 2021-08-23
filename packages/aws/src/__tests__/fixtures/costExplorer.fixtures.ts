/*
 * © 2021 Thoughtworks, Inc.
 */
import { GetRightsizingRecommendationResponse } from 'aws-sdk/clients/costexplorer'

export const rightsizingRecommendationTerminate: GetRightsizingRecommendationResponse =
  {
    RightsizingRecommendations: [
      {
        AccountId: 'test-account',
        CurrentInstance: {
          ResourceId: 'test-id',
          InstanceName: 'test-instance-name',
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
      {
        AccountId: 'test-account-1',
        CurrentInstance: {
          ResourceId: 'test-id',
          InstanceName: 'test-instance-name',
          ResourceDetails: {
            EC2ResourceDetails: {
              InstanceType: 'm5zn.2xlarge',
              Region: 'US East (Ohio)',
              Vcpu: '32',
            },
          },
        },
        RightsizingType: 'Terminate',
        TerminateRecommendationDetail: {
          EstimatedMonthlySavings: '80',
        },
      },
      {
        AccountId: 'test-account-2',
        CurrentInstance: {
          ResourceId: 'test-id',
          InstanceName: 'test-instance-name',
          ResourceDetails: {
            EC2ResourceDetails: {
              InstanceType: 't2.micro',
              Region: 'US East (Ohio)',
              Vcpu: '1',
            },
          },
        },
        RightsizingType: 'Terminate',
        TerminateRecommendationDetail: {
          EstimatedMonthlySavings: '20',
        },
      },
      {
        AccountId: 'test-account-3',
        CurrentInstance: {
          ResourceId: 'test-id',
          InstanceName: '',
          ResourceDetails: {
            EC2ResourceDetails: {
              InstanceType: 't2.micro',
              Region: 'US East (Ohio)',
              Vcpu: '1',
            },
          },
        },
        RightsizingType: 'Terminate',
        TerminateRecommendationDetail: {
          EstimatedMonthlySavings: '30',
        },
      },
    ],
  }

export const rightsizingRecommendationModify: GetRightsizingRecommendationResponse =
  {
    RightsizingRecommendations: [
      {
        AccountId: 'test-account',
        CurrentInstance: {
          ResourceId: 'Test-resource-id',
          InstanceName: 'test-instance-name',
          ResourceDetails: {
            EC2ResourceDetails: {
              InstanceType: 't2.micro',
              Region: 'US East (Ohio)',
              Vcpu: '1',
            },
          },
        },
        RightsizingType: 'Modify',
        ModifyRecommendationDetail: {
          TargetInstances: [
            {
              EstimatedMonthlySavings: '226',
              ResourceDetails: {
                EC2ResourceDetails: {
                  InstanceType: 't2.nano',
                  Region: 'US East (Ohio)',
                  Vcpu: '1',
                },
              },
            },
            {
              EstimatedMonthlySavings: '116',
              ResourceDetails: {
                EC2ResourceDetails: {
                  InstanceType: 't2.large',
                  Region: 'US East (Ohio)',
                  Vcpu: '2',
                },
              },
            },
          ],
        },
      },
    ],
  }

export const rightsizingCrossFamilyRecommendationTerminate: GetRightsizingRecommendationResponse =
  {
    RightsizingRecommendations: [
      {
        AccountId: 'test-account',
        CurrentInstance: {
          ResourceId: 'Test-resource-id',
          InstanceName: 'test-instance-name',
          ResourceDetails: {
            EC2ResourceDetails: {
              InstanceType: 't2.micro',
              Region: 'US East (Ohio)',
              Vcpu: '1',
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

export const rightsizingCrossFamilyRecommendationModify: GetRightsizingRecommendationResponse =
  {
    RightsizingRecommendations: [
      {
        AccountId: 'test-account',
        CurrentInstance: {
          ResourceId: 'Test-resource-id',
          InstanceName: 'test-instance-name',
          ResourceDetails: {
            EC2ResourceDetails: {
              InstanceType: 't2.micro',
              Region: 'US East (Ohio)',
              Vcpu: '1',
            },
          },
        },
        RightsizingType: 'Modify',
        ModifyRecommendationDetail: {
          TargetInstances: [
            {
              EstimatedMonthlySavings: '20',
              ResourceDetails: {
                EC2ResourceDetails: {
                  InstanceType: 't3.micro',
                  Region: 'US East (Ohio)',
                  Vcpu: '2',
                },
              },
            },
          ],
        },
      },
    ],
  }
