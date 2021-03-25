/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import fs from 'fs'

export function getTargetDir(): string {
  // Drive letter can end up being lowercased here on Windows, bring back to uppercase for consistency
  return fs
    .realpathSync(process.cwd())
    .replace(/^[a-z]:/, (str) => str.toUpperCase())
}
