/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { createLogger, format, transports, Logger as WinstonLogger } from 'winston'
const { combine, timestamp, label, printf } = format

import ILogger from '@services/ILogger'

const env = process.env.NODE_ENV || 'development'

export default class Logger implements ILogger {
  private logger: WinstonLogger

  private readonly format = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`
  })

  constructor(logLabel: string) {
    this.logger = createLogger({
      level: this.getLogLevel(env),
      format: combine(label({ label: logLabel }), timestamp(), this.format),
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), this.format),
        }),
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new transports.File({ filename: 'logs/combined.log' }),
      ],
      silent: env === 'test',
    })
  }

  private getLogLevel(env: string): string {
    if (env === 'test' || env === 'development') {
      return 'debug'
    }
    return 'info'
  }

  debug(message: string): void {
    this.logger.debug(message)
  }

  info(message: string): void {
    this.logger.info(message)
  }

  warning(message: string): void {
    this.logger.warning(message)
  }

  error(message: string): void {
    this.logger.error(message)
  }
}
