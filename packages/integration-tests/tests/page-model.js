import { Selector } from 'testcafe'

class Page {
  constructor() {
    //loading screen
    this.loading = Selector('#loading-screen')
    //app header
    this.header = Selector('#app-bar-header')

    //footprint page - main components
    this.cloudProviders = Selector('span').withText('Cloud Providers: 3 of 3')
    this.accounts = Selector('span').withText('Accounts: 12 of 12')
    this.services = Selector('span').withText('Services: 8 of 8')
    this.lineChart = Selector('#apexchartslineChart')
    this.carbonComparisonCard = Selector('#carbonComparisonCard')
    this.emissionsBreakdownContainer = Selector('#emissionsBreakdownContainer')

    //side drawer - buttons and drawer itself
    this.drawerOpenButton = Selector('#info-button')
    this.drawerCloseButton = Selector('#close-button-container').child(
      '.MuiIconButton-root',
    )
    this.drawerOpen = Selector('#drawer-open')

    //co2 amount dropdowns
    this.totalCo2Amount = Selector('#metric-one')
    this.cloudProviderDropDown = Selector('#cloud-provider-filter')
      .sibling('div')
      .child('button')
    this.accountsDropDown = Selector('#accounts-filter')
      .sibling('div')
      .child('button')
    this.servicesDropDown = Selector('#services-filter')
      .sibling('div')
      .child('button')
    this.awsDropdownItem = Selector('#cloud-provider-filter-option-1')
    this.accountsDropdownItem = Selector('#accounts-filter-option-1')
    this.servicesDropdownItem = Selector('#services-filter-option-1')
  }
}

export default new Page()
