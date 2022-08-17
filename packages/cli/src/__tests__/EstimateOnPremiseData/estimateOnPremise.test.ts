/*
 * © 2021 Thoughtworks, Inc.
 */

import fs from 'fs'
import path from 'path'
import process from 'process'
import estimateOnPremiseData from '../../EstimateOnPremiseData/estimateOnPremiseData'

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
  configLoader: jest.fn().mockImplementation(() => {
    return {
      ON_PREMISE: {
        SERVER: {
          CPU_UTILIZATION: undefined,
          AVERAGE_WATTS: undefined,
        },
        LAPTOP: {
          CPU_UTILIZATION: undefined,
          AVERAGE_WATTS: undefined,
        },
        DESKTOP: {
          CPU_UTILIZATION: undefined,
          AVERAGE_WATTS: undefined,
        },
      },
    }
  }),
}))

describe('estimateOnPremiseData', () => {
  let inputFilePath: string
  let outputFilePath: string

  describe('creates on premise estimates CSV', () => {
    afterEach(() => {
      try {
        fs.unlinkSync(outputFilePath)
      } catch (err) {
        console.log(err)
      }
    })
    it('creates on premise CSV file, with default output file path', async () => {
      inputFilePath = path.join(__dirname, 'on_premise_data_input.test.csv')
      outputFilePath = path.join(process.cwd(), 'on_premise_estimations.csv')

      await estimateOnPremiseData([
        'executable',
        'file',
        '--onPremiseInput',
        inputFilePath,
      ])

      expect(fs.existsSync(outputFilePath)).toBe(true)
      expect(fs.readFileSync(outputFilePath).toString()).toMatchSnapshot()
    })

    it('creates on premise CSV file, with provided output file name', async () => {
      inputFilePath = path.join(__dirname, 'on_premise_data_input.test.csv')
      outputFilePath = path.join(
        process.cwd(),
        'on_premise_estimations_data.csv',
      )

      await estimateOnPremiseData([
        'executable',
        'file',
        '--onPremiseInput',
        inputFilePath,
        '--onPremiseOutput',
        'on_premise_estimations_data.csv',
      ])

      expect(fs.existsSync(outputFilePath)).toBe(true)
      expect(fs.readFileSync(outputFilePath).toString()).toMatchSnapshot()
    })
  })

  it('Throws if the input data file is incorrect', async () => {
    inputFilePath = path.join(__dirname, 'incorrect_input.test.csv')

    await expect(() =>
      estimateOnPremiseData([
        'executable',
        'file',
        '--onPremiseInput',
        inputFilePath,
      ]),
    ).rejects.toThrow(
      'Input data is incorrect. Please check your input data file and try again.',
    )
  })
})
