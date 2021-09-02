/*
 * © 2021 Thoughtworks, Inc.
 */

import { renderHook, act, HookResult } from '@testing-library/react-hooks'
import useFilters, { UseFiltersResults } from './FilterHook'
import moment from 'moment'
import { generateEstimations } from 'utils/data'
import { FilterResultResponse } from 'Types'
import { EmissionsFilters } from '../../../pages/EmissionsMetricsPage/EmissionsFilterBar/utils/EmissionsFilters'

//TODO: Make this test not be dependent on EmissionsFilters
describe('useFilters', () => {
  describe('changing timeframe', () => {
    const estimationResults = generateEstimations(moment.utc(), 14)
    const filteredResult: FilterResultResponse = { accounts: [], services: [] }
    let result: HookResult<UseFiltersResults>

    beforeEach(() => {
      const buildFilter = (filteredResponse: FilterResultResponse) => {
        const updatedConfig = EmissionsFilters.generateConfig(filteredResponse)
        return new EmissionsFilters(updatedConfig)
      }
      result = renderHook(() =>
        useFilters(estimationResults, buildFilter, filteredResult),
      ).result
    })

    test('it should filter 12 months + prior by default', () => {
      expect(result.current.filters.timeframe).toBe(36)
      expect(result.current.filteredData).toEqual(
        estimationResults.slice(0, 37),
      )
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
      expect(result.current.filteredData).toEqual(
        estimationResults.slice(0, 13),
      )
    })
  })
})
