/*
 * © 2021 Thoughtworks, Inc.
 */

import * as external from '../../GuidedInstall/external'
import {
  confirmPrompt,
  createEnvFile,
  inputPrompt,
  listPrompt,
} from '../../GuidedInstall/common'
import { confirm, input, list } from 'typed-prompts'

jest.mock('../../GuidedInstall/external')
const mockPrompt: jest.Mock = external.prompt as jest.Mock
const mockExit: jest.Mock = external.exit as jest.Mock
const mockLog: jest.Mock = external.log as jest.Mock
const mockResolve: jest.Mock = external.resolve as jest.Mock
const mockStat: jest.Mock = external.stat as jest.Mock
const mockReadConfig: jest.Mock = external.readConfig as jest.Mock
const mockWriteFile: jest.Mock = external.writeFile as jest.Mock

describe('common', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('listPrompt', () => {
    it('passes the params to a ListQuestion', async () => {
      mockPrompt.mockResolvedValueOnce({})

      await listPrompt('message', ['option1', 'option2'])

      expect(mockPrompt).toHaveBeenCalledWith(
        list('key', 'message', ['option1', 'option2']),
      )
    })

    it('returns the selected option', async () => {
      mockPrompt.mockResolvedValueOnce({ key: 'option2' })

      const result = await listPrompt('message', ['option1', 'option2'])

      expect(result).toEqual('option2')
    })
  })

  describe('confirmPrompt', () => {
    it('passes the message to a ConfirmQuestion', async () => {
      mockPrompt.mockResolvedValueOnce({})

      await confirmPrompt('message')

      expect(mockPrompt).toHaveBeenCalledWith(
        confirm('key', 'message\nIs this step complete?'),
      )
    })

    it('passes a custom question to a ConfirmQuestion', async () => {
      mockPrompt.mockResolvedValueOnce({})

      await confirmPrompt('message', 'for real?')

      expect(mockPrompt).toHaveBeenCalledWith(
        confirm('key', 'message\nfor real?'),
      )
    })

    describe('when yes is required', () => {
      describe('when the answer is yes', () => {
        it('returns true', async () => {
          mockPrompt.mockResolvedValueOnce({ key: true })

          const result = await confirmPrompt('message')

          expect(result).toEqual(true)
          expect(mockExit).not.toHaveBeenCalled()
        })
      })

      describe('when the answer is no', () => {
        it('exits the program', async () => {
          mockPrompt.mockResolvedValueOnce({ key: false })

          await confirmPrompt('message')

          expect(mockExit).toHaveBeenCalled()
        })

        it('asks the user to complete the step', async () => {
          mockPrompt.mockResolvedValueOnce({ key: false })

          await confirmPrompt('message')

          expect(mockLog).toHaveBeenCalledWith(
            'Please try again when you have completed this step.',
          )
        })
      })
    })

    describe('when yes is not required', () => {
      describe('when the answer is yes', () => {
        it('returns true', async () => {
          mockPrompt.mockResolvedValueOnce({ key: true })

          const result = await confirmPrompt('message', 'for real?', false)

          expect(result).toEqual(true)
          expect(mockExit).not.toHaveBeenCalled()
        })
      })

      describe('when the answer is no', () => {
        it('returns false', async () => {
          mockPrompt.mockResolvedValueOnce({ key: false })

          const result = await confirmPrompt('message', 'for real?', false)

          expect(result).toEqual(false)
          expect(mockExit).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('inputPrompt', () => {
    it('passes the message to an InputQuestion', async () => {
      mockPrompt.mockResolvedValueOnce({ key: 'hi' })

      await inputPrompt('message')

      expect(mockPrompt).toHaveBeenCalledWith(input('key', 'message'))
    })

    describe('when answer is required', () => {
      describe('when answer is given', () => {
        it('returns the answer', async () => {
          mockPrompt.mockResolvedValueOnce({ key: 'hi' })

          const result = await inputPrompt('message')

          expect(result).toEqual('hi')
        })
      })

      describe('when answer is not given', () => {
        it('asks the user for the answer until they give it', async () => {
          mockPrompt
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ key: 'hi' })

          const result = await inputPrompt('message')

          expect(result).toEqual('hi')
          expect(mockLog).toHaveBeenCalledTimes(2)
          expect(mockLog).toHaveBeenNthCalledWith(1, 'Please enter a value.')
          expect(mockLog).toHaveBeenNthCalledWith(2, 'Please enter a value.')
        })
      })
    })

    describe('when answer is not required', () => {
      describe('when answer is given', () => {
        it('returns the answer', async () => {
          mockPrompt.mockResolvedValueOnce({ key: 'hi' })

          const result = await inputPrompt('message', false)

          expect(result).toEqual('hi')
        })
      })

      describe('when answer is not given', () => {
        it('returns the answer', async () => {
          mockPrompt.mockResolvedValueOnce({})

          const result = await inputPrompt('message', false)

          expect(result).toEqual(undefined)
          expect(mockLog).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('createEnvFile', () => {
    beforeEach(() => {
      mockResolve.mockReturnValueOnce('/absolute/path/.env')
    })

    describe('when the env file already exists', () => {
      beforeEach(() => {
        mockStat.mockResolvedValueOnce({ some: 'data about the file' })
      })

      describe('when the previous config is read', () => {
        beforeEach(() => {
          mockReadConfig.mockReturnValueOnce({
            parsed: { prev1: 'value1', prev2: 'value2' },
          })
        })

        it('only overwrites the given keys', async () => {
          await createEnvFile('../api', { new1: 'value3', prev2: 'value4' })

          expect(mockWriteFile).toHaveBeenCalledWith(
            '/absolute/path/.env',
            'prev1=value1\nprev2=value4\nnew1=value3\n',
          )
        })
      })

      describe('when there is an error reading the previous config', () => {
        beforeEach(() => {
          mockReadConfig.mockReturnValueOnce({
            error: new Error('uh oh'),
          })
        })

        it('throws the error', async () => {
          await expect(createEnvFile('../api', {})).rejects.toThrow('uh oh')
        })
      })
    })

    describe('when the env file is created for the first time', () => {
      beforeEach(() => {
        mockStat.mockRejectedValue('file not found')
      })

      it('writes the new config', async () => {
        await createEnvFile('../api', { new1: 'value1', new2: 'value2' })

        expect(mockWriteFile).toHaveBeenCalledWith(
          '/absolute/path/.env',
          'new1=value1\nnew2=value2\n',
        )
      })

      it('does not attempt to read previous config', async () => {
        await createEnvFile('../api', { new1: 'value1', new2: 'value2' })

        expect(mockReadConfig).not.toHaveBeenCalled()
      })
    })
  })
})
