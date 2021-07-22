/*
 * © 2021 Thoughtworks, Inc.
 */

const dayOne = '2020-07-01 00:00:00.000'
const dayTwo = '2020-07-02 00:00:00.000'

export const mockLambdaLogGroups = [
  {
    logGroupName: '/aws/lambda/sample-function-name',
  },
  {
    logGroupName: '/aws/lambda/sample-function-name-2',
  },
]

export const mockStartQueryResponse = {
  queryId: '321db1cd-5790-47aa-a3ab-e5036ffdd16f',
}

export const mockGetQueryResults = {
  results: [
    [
      {
        field: 'Date',
        value: dayOne,
      },
      {
        field: 'Watts',
        value: '0.20',
      },
    ],
    [
      {
        field: 'Date',
        value: dayTwo,
      },
      {
        field: 'Watts',
        value: '0.23',
      },
    ],
  ],
  status: 'Complete',
}
