/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { renderHook, act, HookResult } from '@testing-library/react-hooks'
import useFilters, { UseFiltersResults } from './FilterHook'
import moment from 'moment'
import generateEstimations from '../../data/generateEstimations'

describe('useFilters', () => {
  describe('changing timeframe', () => {
    const estimationResults = generateEstimations(moment.utc(), 14)
    const filteredResult = { accounts: [] }
    let result: HookResult<UseFiltersResults>

    beforeEach(() => {
      result = renderHook(() => useFilters(estimationResults, filteredResult)).result
    })

    test('it should filter up to 12 months prior by default', () => {
      expect(result.current.filters.timeframe).toBe(12)
      expect(result.current.filteredData).toEqual(estimationResults.slice(0, 13))
    })

    test('it should filter up to 1 month prior', () => {
      act(() => {
        result.current.setFilters(result.current.filters.withTimeFrame(1))
      })
      expect(result.current.filters.timeframe).toBe(1)
      expect(result.current.filteredData).toEqual(estimationResults.slice(0, 2))
    })

    test('it should filter up to 3 months prior', () => {
      act(() => {
        result.current.setFilters(result.current.filters.withTimeFrame(3))
      })
      expect(result.current.filters.timeframe).toBe(3)
      expect(result.current.filteredData).toEqual(estimationResults.slice(0, 4))
    })

    test('it should filter up to 6 months prior', () => {
      act(() => {
        result.current.setFilters(result.current.filters.withTimeFrame(6))
      })
      expect(result.current.filters.timeframe).toBe(6)
      expect(result.current.filteredData).toEqual(estimationResults.slice(0, 7))
    })

    test('it should filter up to 12 months prior', () => {
      act(() => {
        result.current.setFilters(result.current.filters.withTimeFrame(1))
      })
      act(() => {
        result.current.setFilters(result.current.filters.withTimeFrame(12))
      })
      expect(result.current.filters.timeframe).toBe(12)
      expect(result.current.filteredData).toEqual(estimationResults.slice(0, 13))
    })
  })
})
