/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

export default interface ILogger {
  debug(message: string): void
  info(message: string): void
  warning(message: string): void
  error(message: string): void
}
