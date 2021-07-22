/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from 'winston'
const { combine, timestamp, label, printf } = format
import { LoggingWinston } from '@google-cloud/logging-winston'

import ILogger from './ILogger'
import configLoader from './ConfigLoader'

const env = process.env.NODE_ENV || 'development'

enum LOGGING_LEVELS {
  ERROR = 'error',
  INFO = 'info',
  DEBUG = 'debug',
}

export default class Logger implements ILogger {
  private logger: WinstonLogger

  private readonly format = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message} `
  })

  constructor(logLabel: string) {
    try {
      switch (configLoader().LOGGING_MODE) {
        case 'GCP':
          this.logger = this.getGCPLogger()
          break
        default:
          this.logger = this.getDefaultLogger(logLabel)
      }
    } catch (error) {
      this.getDefaultLogger(logLabel).error(error)
    }
  }

  private getGCPLogger() {
    return createLogger({
      level: this.getLogLevel(env),
      transports: [new transports.Console(), new LoggingWinston()],
      silent: env === 'test',
    })
  }

  private getDefaultLogger(logLabel: string) {
    return createLogger({
      level: this.getLogLevel(env),
      format: combine(label({ label: logLabel }), timestamp(), this.format),
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), this.format),
        }),
        new transports.File({
          filename: 'logs/error.log',
          level: LOGGING_LEVELS.ERROR,
        }),
        new transports.File({ filename: 'logs/combined.log' }),
      ],
      silent: env === 'test',
    })
  }

  private getLogLevel(env: string): string {
    if (env === 'test' || env === 'development') {
      return LOGGING_LEVELS.DEBUG
    }
    return LOGGING_LEVELS.INFO
  }

  debug(message: string): void {
    this.logger.debug(message)
  }

  info(message: string): void {
    this.logger.info(message)
  }

  warn(message: string): void {
    this.logger.warn(message)
  }

  error(message: string, error: Error): void {
    this.logger.error(message + error.stack)
  }
}
