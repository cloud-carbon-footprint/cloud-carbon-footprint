/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { DropdownOption } from './DropdownFilter'
import { alphabetizeDropdownOptions } from './DropdownConstants'

describe('DropdownConstants', () => {
  describe('alphabetize dropdownOptions', () => {
    it('should put key A before Key b when given two Dropdown Options', () => {
      const dropdownOption0: DropdownOption = {
        key: '0KeyFirstDropdown',
        name: '0NameFirstDropdown',
        cloudProvider: 'aws',
      }
      const dropdownOptionA: DropdownOption = {
        key: 'aKeyFirstDropdown',
        name: 'aNameFirstDropdown',
        cloudProvider: 'aws',
      }
      const dropdownOptionB: DropdownOption = {
        key: 'bKeyFirstDropdown',
        name: 'bNameFirstDropdown',
        cloudProvider: 'aws',
      }
      const dropdownOptionC: DropdownOption = {
        key: 'cKeyFirstDropdown',
        name: 'cNameFirstDropdown',
        cloudProvider: 'aws',
      }
      const dropdownOptionD: DropdownOption = {
        key: 'dKeyFirstDropdown',
        name: 'dNameFirstDropdown',
        cloudProvider: 'aws',
      }
      const mixedDropdownOptions: DropdownOption[] = [
        dropdownOptionC,
        dropdownOptionA,
        dropdownOption0,
        dropdownOptionD,
        dropdownOptionB,
      ]
      const orderedDropdownOptions: DropdownOption[] = [
        dropdownOption0,
        dropdownOptionA,
        dropdownOptionB,
        dropdownOptionC,
        dropdownOptionD,
      ]

      alphabetizeDropdownOptions(mixedDropdownOptions)

      expect(mixedDropdownOptions).toEqual(orderedDropdownOptions)
    })
  })
})
