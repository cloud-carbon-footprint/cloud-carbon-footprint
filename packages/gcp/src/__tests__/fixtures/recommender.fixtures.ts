/*
 * © 2021 ThoughtWorks, Inc.
 */

export const mockRecommendationsResults: any = [
  [
    {
      additionalImpact: [],
      associatedInsights: [[Object]],
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
export const mockRecommenderClient = {
  listRecommendations: jest
    .fn()
    .mockResolvedValueOnce(mockRecommendationsResults)
    .mockResolvedValue([[]]),
  projectLocationRecommenderPath: jest.fn(),
}
