/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
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

import Logger from '@services/Logger'
import mockConfig from '@application/Config'

describe('Logger', () => {
  const testMessage = 'test log message'

  describe('Default logger', () => {
    const testLogger = new Logger('test')

    afterEach(() => {
      jest.resetAllMocks()
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
      testLogger.error(testMessage)

      // then
      expect(mockLogger.error).toHaveBeenCalledWith(testMessage)
    })
  })

  describe('GCP logger', () => {
    mockConfig.LOGGING_MODE = 'GCP'
    const testLogger = new Logger('test')

    afterEach(() => {
      jest.resetAllMocks()
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
      testLogger.error(testMessage)

      // then
      expect(mockLogger.error).toHaveBeenCalledWith(testMessage)
    })
  })
})
