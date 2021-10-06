/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import FilterDropdown from 'common/FilterDropdown'
import { DropdownFilterOptions, DropdownOption, FilterProps } from 'Types'

const RecommendationTypeFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
  options,
}) => {
  const recommendationTypeOptions = options.recommendationTypes
  return (
    <FilterDropdown
      id="recommendations-type-filter"
      displayValue={filters.label(
        recommendationTypeOptions,
        DropdownFilterOptions.RECOMMENDATION_TYPES,
      )}
      options={recommendationTypeOptions}
      selections={filters.options.recommendationTypes}
      selectionToOption={(recommendationType) => recommendationType}
      updateSelections={(selections: DropdownOption[]) => {
        setFilters(
          filters.withDropdownOption(
            selections,
            options,
            DropdownFilterOptions.RECOMMENDATION_TYPES,
          ),
        )
      }}
    />
  )
}

export default RecommendationTypeFilter
