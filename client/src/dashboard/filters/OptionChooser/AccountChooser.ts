import { DropdownOption } from '../DropdownFilter'
import { FilterType, Selections } from '../FiltersUtil'
import { ACCOUNT_OPTIONS } from '../AccountFilter'
import { CLOUD_PROVIDER_OPTIONS, SERVICE_OPTIONS } from '../DropdownConstants'
import { OptionChooser } from './OptionChooser'
import { isDropdownOptionInDropdownOptions, providerServices } from './common'

export class AccountChooser extends OptionChooser {
  constructor(selections: DropdownOption[], oldSelections: Selections) {
    super(FilterType.ACCOUNTS, ACCOUNT_OPTIONS, selections, oldSelections)
  }

  protected chooseProviders(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    getCloudProvidersFromAccounts(this.selections).forEach((cloudProviderOption) =>
      desiredSelections.add(cloudProviderOption),
    )
    return desiredSelections
  }

  protected chooseAccounts(): Set<DropdownOption> {
    return new Set(this.selections)
  }

  protected chooseServices(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    const currentCloudProviders = Array.from(getCloudProvidersFromAccounts(this.selections))
    currentCloudProviders.forEach((currentCloudProvider) => {
      //if currentCloudprovider has an option that oldCP has, keep the services from old that are under that CP
      if (isDropdownOptionInDropdownOptions(this.oldSelections.cloudProviders, currentCloudProvider)) {
        this.oldSelections.services.forEach((oldServiceOption) => {
          providerServices[currentCloudProvider.key].includes(oldServiceOption.key)
            ? desiredSelections.add(oldServiceOption)
            : null
        })
      } else {
        //if currentCloudprovider doesnt have an option that oldCP has, add all the services from that CP
        providerServices[currentCloudProvider.key].forEach((service) =>
          desiredSelections.add(<DropdownOption>SERVICE_OPTIONS.find((option) => option.key === service)),
        )
      }
    })
    return desiredSelections
  }
}

function getCloudProvidersFromAccounts(accountSelections: DropdownOption[]): Set<DropdownOption> {
  const cloudProviderSelections: Set<DropdownOption> = new Set<DropdownOption>()
  accountSelections.forEach((selection) => {
    if (selection.key !== 'all') {
      cloudProviderSelections.add(
        <DropdownOption>CLOUD_PROVIDER_OPTIONS.find((option) => option.key === selection.cloudProvider),
      )
    }
  })
  return cloudProviderSelections
}
