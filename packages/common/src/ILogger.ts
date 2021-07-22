/*
 * © 2021 Thoughtworks, Inc.
 */

export default interface ILogger {
  debug(message: string): void
  info(message: string): void
  warn(message: string): void
  error(message: string, error: Error): void
}
