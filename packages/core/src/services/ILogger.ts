/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

export default interface ILogger {
  debug(message: string): void
  info(message: string): void
  warn(message: string): void
  error(message: string, error: Error): void
}
