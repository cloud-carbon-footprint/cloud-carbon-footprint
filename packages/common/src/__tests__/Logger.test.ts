/*
 * © 2021 Thoughtworks, Inc.
 */

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}

jest.mock('winston', () => {
  return {
    format: {
      colorize: jest.fn(),
      combine: jest.fn(),
      label: jest.fn(),
      timestamp: jest.fn(),
      printf: jest.fn(),
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
    createLogger: jest.fn().mockReturnValue(mockLogger),
  }
})

import Logger from '../Logger'
import { setConfig } from '../ConfigLoader'

describe('Logger', () => {
  const testMessage = 'test log message'
  const testErr = new Error('error test message')

  describe('Default logger', () => {
    let testLogger: Logger = undefined

    beforeEach(() => {
      setConfig({
        LOGGING_MODE: null,
      })
      testLogger = new Logger('test')
    })

    it('logs debug', () => {
      // when
      testLogger.debug(testMessage)

      // then
      expect(mockLogger.debug).toHaveBeenCalledWith(testMessage)
    })

    it('logs info', () => {
      // when
      testLogger.info(testMessage)

      // then
      expect(mockLogger.info).toHaveBeenCalledWith(testMessage)
    })

    it('logs warning', () => {
      // when
      testLogger.warn(testMessage)

      // then
      expect(mockLogger.warn).toHaveBeenCalledWith(testMessage)
    })

    it('logs error', () => {
      // when
      testLogger.error(testMessage, testErr)

      // then
      expect(mockLogger.error).toHaveBeenCalledWith(
        `${testMessage}${testErr.stack}`,
      )
    })
  })

  describe('GCP logger', () => {
    let testLogger: Logger = undefined

    beforeEach(() => {
      setConfig({
        LOGGING_MODE: 'GCP',
      })

      testLogger = new Logger('test')
    })

    it('logs debug', () => {
      // when
      testLogger.debug(testMessage)

      // then
      expect(mockLogger.debug).toHaveBeenCalledWith(testMessage)
    })

    it('logs info', () => {
      // when
      testLogger.info(testMessage)

      // then
      expect(mockLogger.info).toHaveBeenCalledWith(testMessage)
    })

    it('logs warning', () => {
      // when
      testLogger.warn(testMessage)

      // then
      expect(mockLogger.warn).toHaveBeenCalledWith(testMessage)
    })

    it('logs error', () => {
      // when
      testLogger.error(testMessage, testErr)
      const mockErr = Object.getPrototypeOf(testLogger)

      // then
      expect(mockLogger.error).toHaveBeenCalledWith(
        `${testMessage}${testErr.stack}`,
      )
      expect(mockErr.getLogLevel('test')).toEqual('debug')
    })

    it('Info Log Info', () => {
      // when
      testLogger.error(testMessage, testErr)
      const mockErr = Object.getPrototypeOf(testLogger)

      // then
      expect(mockLogger.error).toHaveBeenCalledWith(
        `${testMessage}${testErr.stack}`,
      )
      expect(mockErr.getLogLevel('otherTestEnv')).toEqual('info')
    })
  })
})
