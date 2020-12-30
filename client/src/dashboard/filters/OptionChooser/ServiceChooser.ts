import { DropdownOption } from '../DropdownFilter'
import { FilterType, Selections } from '../FiltersUtil'
import { CLOUD_PROVIDER_OPTIONS, SERVICE_OPTIONS } from '../DropdownConstants'
import { ACCOUNT_OPTIONS } from '../AccountFilter'
import { OptionChooser } from './OptionChooser'
import { isDropdownOptionInDropdownOptions, providerServices } from './common'

export class ServiceChooser extends OptionChooser {
  constructor(selections: DropdownOption[], oldSelections: Selections) {
    super(FilterType.SERVICES, SERVICE_OPTIONS, selections, oldSelections)
  }

  protected chooseProviders(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    getCloudProvidersFromServices(this.selections).forEach((cloudProviderOption) =>
      desiredSelections.add(cloudProviderOption),
    )
    return desiredSelections
  }

  protected chooseAccounts(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    const currentCloudProviders = Array.from(getCloudProvidersFromServices(this.selections))
    currentCloudProviders.forEach((currentCloudProvider) => {
      //if currentCloudprovider has an option that oldCP has, keep the accounts from old that are under that CP
      if (isDropdownOptionInDropdownOptions(this.oldSelections.cloudProviders, currentCloudProvider)) {
        this.oldSelections.accounts.forEach((oldAccountOption) => {
          oldAccountOption.cloudProvider === currentCloudProvider.key ? desiredSelections.add(oldAccountOption) : null
        })
      } else {
        //if currentCloudprovider doesnt have an option that oldCP has, add all the accounts from that CP
        ACCOUNT_OPTIONS.forEach((accountOption) => {
          accountOption.cloudProvider === currentCloudProvider.key ? desiredSelections.add(accountOption) : null
        })
      }
    })
    return desiredSelections
  }

  protected chooseServices(): Set<DropdownOption> {
    return new Set(this.selections)
  }
}

export function getCloudProvidersFromServices(serviceSelections: DropdownOption[]): Set<DropdownOption> {
  const keys = serviceSelections.map((selection) => selection.key)
  const cloudProviderSelections: Set<DropdownOption> = new Set<DropdownOption>()
  for (const [key, value] of Object.entries(providerServices)) {
    if (value.some((service) => keys.includes(service))) {
      cloudProviderSelections.add(<DropdownOption>CLOUD_PROVIDER_OPTIONS.find((option) => option.key === key))
    }
  }
  return cloudProviderSelections
}
