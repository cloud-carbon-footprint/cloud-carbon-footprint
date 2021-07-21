/*
 * © 2021 ThoughtWorks, Inc.
 */

export const mockStopVMRecommendationsResults: any = [
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
        projection: 'costProjection',
      },
      recommenderSubtype: 'STOP_VM',
    },
  ],
]

export const mockStopVMWithAdditionalImpactRecommendationsResults: any = [
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
          projection: 'costProjection',
        },
      ],
      primaryImpact: { category: 'PERFORMANCE' },
      recommenderSubtype: 'STOP_VM',
    },
  ],
]

export const mockChangeMachineTypeRecommendationsResults: any = [
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
        projection: 'costProjection',
      },
      recommenderSubtype: 'CHANGE_MACHINE_TYPE',
    },
  ],
]

export const mockDeleteDiskRecommendationsResults: any = [
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
        projection: 'costProjection',
      },
      recommenderSubtype: 'DELETE_DISK',
    },
  ],
]

export const mockSnapshotAndDeleteDiskRecommendationsResults: any = [
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
        projection: 'costProjection',
      },
      recommenderSubtype: 'SNAPSHOT_AND_DELETE_DISK',
    },
  ],
]

export const mockDeleteImageRecommendationsResults: any = [
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
        projection: 'costProjection',
      },
      recommenderSubtype: 'DELETE_IMAGE',
    },
  ],
]

export const mockDeleteSnapshotRecommendationsResults: any = [
  [
    {
      name: 'project-name',
      description: "Save cost by deleting idle snapshot 'test-snapshot'.",
      primaryImpact: {
        category: 'COST',
        costProjection: {
          cost: {
            units: -40,
            nanos: 0,
          },
        },
        projection: 'costProjection',
      },
      recommenderSubtype: 'DELETE_SNAPSHOT',
    },
  ],
]

export const mockEmptyRecommendationsResults: any = [[]]
