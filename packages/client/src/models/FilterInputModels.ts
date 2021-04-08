/*
 * © 2021 ThoughtWorks, Inc.
 */

import { DropdownOption } from '../dashboard/filters/DropdownFilter'

export class Account implements DropdownOption {
  readonly key: string
  readonly name: string
  readonly cloudProvider: string

  constructor(key: string, name: string, cloudProvider: string) {
    this.key = key
    this.name = name
    this.cloudProvider = cloudProvider
  }
}
