/*
 * © 2021 Thoughtworks, Inc.
 */

import { DropdownOption } from 'Types'
import {
  alphabetizeDropdownOptions,
  buildAndOrderDropdownOptions,
} from './DropdownConstants'

describe('DropdownConstants', () => {
  describe('sort dropdownOptions', () => {
    it('should sort alphanumerically ', () => {
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

    it('should sort case insensitive', () => {
      const optionA: DropdownOption = {
        key: 'key',
        name: 'Zebra',
        cloudProvider: 'aws',
      }
      const optionB: DropdownOption = {
        key: 'key-two',
        name: 'alpha',
        cloudProvider: 'aws',
      }
      const optionC: DropdownOption = {
        key: 'key-three',
        name: 'beta',
        cloudProvider: 'aws',
      }

      const sortedOptions = alphabetizeDropdownOptions([
        optionA,
        optionB,
        optionC,
      ])

      expect(sortedOptions).toEqual([optionB, optionC, optionA])
    })

    it('should ignore surrounding whitespace when sorting', () => {
      const optionA: DropdownOption = {
        key: 'also-some-key',
        name: ' Zebra',
        cloudProvider: 'aws',
      }
      const optionB: DropdownOption = {
        key: 'some-key',
        name: 'Alpha',
        cloudProvider: 'aws',
      }

      const sortedOptions = alphabetizeDropdownOptions([optionA, optionB])

      expect(sortedOptions).toEqual([optionB, optionA])
    })
  })
  describe('buildAndOrderDropdownOptions', () => {
    const optionA: DropdownOption = {
      key: 'key-three',
      name: 'beta',
      cloudProvider: 'gcp',
    }
    const optionB: DropdownOption = {
      key: 'key',
      name: 'Zebra',
      cloudProvider: 'aws',
    }
    const optionC: DropdownOption = {
      key: 'key-two',
      name: 'alpha',
      cloudProvider: 'aws',
    }
    it('should sort alphabetically and group by cloud providers', () => {
      expect(buildAndOrderDropdownOptions([optionA, optionB, optionC])).toEqual(
        [optionC, optionB, optionA],
      )
    })

    it('will sort using fallback options if no main options available', () => {
      expect(
        buildAndOrderDropdownOptions(undefined, [optionA, optionB, optionC]),
      ).toEqual([optionC, optionB, optionA])
    })

    it('handles options with missing cloudProviders', () => {
      const option1WithoutCloudProvider = { key: 'test1', name: 'gamma' }
      const option2WithoutCloudProvider = { key: 'test2', name: 'epsilon' }
      expect(
        buildAndOrderDropdownOptions(undefined, [
          optionA,
          optionB,
          optionC,
          option1WithoutCloudProvider,
          option2WithoutCloudProvider,
        ]),
      ).toEqual([
        option2WithoutCloudProvider,
        option1WithoutCloudProvider,
        optionC,
        optionB,
        optionA,
      ])
    })
  })
})
