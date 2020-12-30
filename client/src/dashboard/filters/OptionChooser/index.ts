import { OptionChooser } from './OptionChooser'
import { FilterType, Selections } from '../FiltersUtil'
import { DropdownOption } from '../DropdownFilter'
import { CloudProviderChooser } from './CloudProviderChooser'
import { AccountChooser } from './AccountChooser'
import { ServiceChooser } from './ServiceChooser'

export default function createOptionChooser(
  filterType: FilterType,
  selections: DropdownOption[],
  oldSelections: Selections,
): OptionChooser {
  switch (filterType) {
    case FilterType.CLOUD_PROVIDERS:
      return new CloudProviderChooser(selections, oldSelections)
    case FilterType.ACCOUNTS:
      return new AccountChooser(selections, oldSelections)
    case FilterType.SERVICES:
      return new ServiceChooser(selections, oldSelections)
  }
}
