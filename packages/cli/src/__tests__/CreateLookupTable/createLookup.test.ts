/*
 * © 2021 Thoughtworks, Inc.
 */

import fs from 'fs'
import path from 'path'

import createLookupTable from '../../CreateLookupTable/createLookupTable'
import process from 'process'

describe('createLookupTable', () => {
  let inputFilePath: string
  let outputFilePath: string

  describe('creates lookup table CSV', () => {
    afterEach(() => {
      try {
        fs.unlinkSync(outputFilePath)
      } catch (err) {
        console.error(err)
      }
    })
    it('creates AWS lookup table CSV file, with default output file path', async () => {
      inputFilePath = path.join(__dirname, 'aws_input.test.csv')
      outputFilePath = path.join(process.cwd(), 'aws_lookup_data.csv')

      await createLookupTable([
        'executable',
        'file',
        '--awsInput',
        inputFilePath,
      ])

      expect(fs.existsSync(outputFilePath)).toBe(true)
      expect(fs.readFileSync(outputFilePath).toString()).toMatchSnapshot()
    })

    it('creates AWS lookup table CSV file, with provided output file name', async () => {
      inputFilePath = path.join(__dirname, 'aws_input.test.csv')
      outputFilePath = path.join(process.cwd(), 'aws_lookup_data.csv')

      await createLookupTable([
        'executable',
        'file',
        '--awsInput',
        inputFilePath,
        '--awsOutput',
        'aws_lookup_data.csv',
      ])

      expect(fs.existsSync(outputFilePath)).toBe(true)
      expect(fs.readFileSync(outputFilePath).toString()).toMatchSnapshot()
    })
  })

  it('Throws if the input data file is incorrect', async () => {
    inputFilePath = path.join(__dirname, 'incorrect_input.test.csv')

    await expect(() =>
      createLookupTable(['executable', 'file', '--awsInput', inputFilePath]),
    ).rejects.toThrow(
      'Input data is incorrect. Please check your input data file and try again.',
    )
  })
})
