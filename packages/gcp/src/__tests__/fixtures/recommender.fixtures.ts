/*
 * © 2021 Thoughtworks, Inc.
 */

import { google } from '@google-cloud/recommender/build/protos/protos'
import IRecommendation = google.cloud.recommender.v1.IRecommendation

export const mockStopVMRecommendationsResults: IRecommendation[][] = [
  [
    {
      name: 'project-name',
      description: "Save cost by stopping Idle VM 'test-instance'.",
      primaryImpact: {
        category: 'COST',
        costProjection: {
          cost: {
            units: -15,
            nanos: 0,
          },
        },
      },
      recommenderSubtype: 'STOP_VM',
      content: {
        operationGroups: [
          {
            operations: [
              {
                resource:
                  '//compute.googleapis.com/projects/project-name/zones/us-west1-b/instances/instance-name',
              },
            ],
          },
        ],
      },
    },
  ],
]

export const mockStopVMWithAdditionalImpactRecommendationsResults: IRecommendation[][] =
  [
    [
      {
        name: 'project-name',
        description: "Save cost by stopping Idle VM 'test-instance'.",
        additionalImpact: [
          {
            category: 'COST',
            costProjection: {
              cost: {
                units: -55,
                nanos: 0,
              },
            },
          },
        ],
        primaryImpact: { category: 'PERFORMANCE' },
        recommenderSubtype: 'STOP_VM',
        content: {
          operationGroups: [
            {
              operations: [
                {
                  resource:
                    '//compute.googleapis.com/projects/project-name/zones/us-west1-b/instances/instance-name',
                },
              ],
            },
          ],
        },
      },
    ],
  ]

export const mockChangeMachineTypeRecommendationsResults: IRecommendation[][] =
  [
    [
      {
        name: 'project-name',
        description:
          'Save cost by changing machine type from e2-medium to e2-small.',
        primaryImpact: {
          category: 'COST',
          costProjection: {
            cost: {
              units: -20,
              nanos: 0,
            },
          },
        },
        recommenderSubtype: 'CHANGE_MACHINE_TYPE',
        content: {
          operationGroups: [
            {
              operations: [
                {
                  resource:
                    '//compute.googleapis.com/projects/project-name/zones/us-west1-b/instances/instance-name',
                },
              ],
            },
          ],
        },
      },
    ],
  ]

export const mockDeleteDiskRecommendationsResults: IRecommendation[][] = [
  [
    {
      name: 'project-name',
      description: "Save cost by deleting idle persistent disk 'test-disk'.",
      primaryImpact: {
        category: 'COST',
        costProjection: {
          cost: {
            units: -50,
            nanos: 0,
          },
        },
      },
      recommenderSubtype: 'DELETE_DISK',
      content: {
        operationGroups: [
          {
            operations: [
              {
                resource:
                  '//compute.googleapis.com/projects/project-name/zones/us-west1-b/instances/instance-name',
              },
            ],
          },
        ],
      },
    },
  ],
]

export const mockSnapshotAndDeleteDiskRecommendationsResults: IRecommendation[][] =
  [
    [
      {
        name: 'project-name',
        description: "Save cost by deleting idle persistent disk 'test-disk'.",
        primaryImpact: {
          category: 'COST',
          costProjection: {
            cost: {
              units: -50,
              nanos: 0,
            },
          },
        },
        recommenderSubtype: 'SNAPSHOT_AND_DELETE_DISK',
        content: {
          operationGroups: [
            {
              operations: [
                {
                  resource:
                    '//compute.googleapis.com/projects/project-name/zones/us-west1-b/instances/instance-name',
                },
              ],
            },
          ],
        },
      },
    ],
  ]

export const mockDeleteImageRecommendationsResults: IRecommendation[][] = [
  [
    {
      name: 'project-name',
      description: "Save cost by deleting idle image 'test-image'.",
      primaryImpact: {
        category: 'COST',
        costProjection: {
          cost: {
            units: -30,
            nanos: 0,
          },
        },
      },
      recommenderSubtype: 'DELETE_IMAGE',
      content: {
        operationGroups: [
          {
            operations: [
              {
                resource:
                  '//compute.googleapis.com/projects/project-name/zones/us-west1-b/instances/instance-name',
              },
            ],
          },
        ],
      },
    },
  ],
]

const buildDeleteAddressRecommendation = (
  zone = 'us-west1-b',
): IRecommendation[][] => {
  return [
    [
      {
        name: 'project-name',
        description: "Save cost by deleting idle address 'test-address'.",
        primaryImpact: {
          category: 'COST',
          costProjection: {
            cost: {
              units: -40,
              nanos: 0,
            },
          },
        },
        recommenderSubtype: 'DELETE_ADDRESS',
        content: {
          operationGroups: [
            {
              operations: [
                {
                  resource: `//compute.googleapis.com/projects/project-name/zones/${zone}/instances/instance-name`,
                },
              ],
            },
          ],
        },
      },
    ],
  ]
}

export const mockDeleteAddressRecommendationsResults =
  buildDeleteAddressRecommendation()

export const mockEmptyRecommendationsResults: IRecommendation[][] = [[]]

export const mockStopVmAndDeleteAddressRecommendations: IRecommendation[][] = [
  mockStopVMRecommendationsResults
    .concat(buildDeleteAddressRecommendation())
    .flat(),
]

export const mockDeleteAddressRecommendationsEast: IRecommendation[][] =
  buildDeleteAddressRecommendation('us-east1-a')
