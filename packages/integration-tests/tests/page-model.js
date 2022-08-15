/*
 * © 2022 Thoughtworks, Inc.
 */
import { Selector } from 'testcafe'

class Page {
  constructor() {
    //--general components here
    //loading screen
    this.loading = Selector('#loading-screen')
    //app header
    this.header = Selector('#app-bar-header')

    //--footprint page components here

    //main components
    this.cloudProviders = Selector('span').withText('Cloud Providers: 3 of 3')
    this.accounts = Selector('span').withText('Accounts: 15 of 15') //todo: minimize dataset-specific selectors
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

    //emissions breakdown
    this.flightsButton = Selector('#flights')
    this.phonesButton = Selector('#phones')
    this.treesButton = Selector('#trees')
    this.emissionsRecord = Selector('p')

    //emissions bar charts
    this.dropDownSelector = Selector('#breakdown-selector')
    this.accountSelection = Selector('#account-dropdown')
    this.selected = Selector('tspan') //selected account, service, or region
    this.serviceSelection = Selector('#service-dropdown')
    this.regionSelection = Selector('#region-dropdown')

    //line chart legend and axes
    this.kwhLegend = Selector('span').withText('Kilowatt Hours')
    this.costLegend = Selector('span').withText('Cost')
    this.co2eLegend = Selector('span').withText('CO2e')
    this.kwhAxis = Selector('text').withText('Kilowatt Hours (kWh)')
    this.costAxis = Selector('text').withText('Cost ($)')
    this.co2eAxis = Selector('text').withText('CO2e (metric tons)')

    //--recommendations page components here

    //recommendations - main components
    this.recommendationsButton = Selector('a').withText('RECOMMENDATIONS')
    this.regions = Selector('span').withText('Regions: 8 of 8')
    this.recommendationTypes = Selector('span').withText(
      'Recommendation Types: 8 of 8',
    )
    this.recAccounts = Selector('span').withText('Accounts: 10 of 10') //todo: minimize dataset-specific selectors

    //forecast card components
    this.lastThirtyDayTotal = Selector(
      "[data-testid='forecast-card-last-thirty-day-total']",
    )
    this.projectedThirtyDayTotal = Selector(
      "[data-testid='forecast-card-projected-thirty-day-total']",
    )
    this.forecastEquivalencyCard = Selector(
      "[data-testid='forecast-equivalency-card']",
    )
    this.treeSeedlingsGrown = Selector("[data-testid='tree-seedlings-grown']")
    this.costSavingsPerMonth = Selector(
      "[data-testid='cost-savings-per-month']",
    )

    //table components
    this.searchInput = Selector("[data-testid='search-input']")
    this.recommendationsDataGrid = Selector(
      "[data-testid='recommendations-data-grid']",
    )

    //units of measure
    this.unitOfMeasureLastThirtyDayTotal = Selector(
      "[data-testid='unit-of-measure-last-thirty-day-total']",
    )
    this.unitOfMeasureProjectedThirtyDayTotal = Selector(
      "[data-testid='unit-of-measure-projected-thirty-day-total']",
    )
    this.co2eSavingsLastThirtyDayTotal = Selector(
      "[data-testid='co2e-savings-last-thirty-day-total'",
    )
    this.co2eSavingsProjectedThirtyDayTotal = Selector(
      "[data-testid='co2e-savings-projected-thirty-day-total'",
    )
    this.costSavingsLastThirtyDayTotal = Selector(
      "[data-testid='cost-savings-last-thirty-day-total'",
    )
    this.costSavingsProjectedThirtyDayTotal = Selector(
      "[data-testid='cost-savings-projected-thirty-day-total'",
    )
    this.co2eSavingsField = "[data-field='co2eSavings']"
    this.tableSavingsColumn = Selector(
      `[role='columnheader']${this.co2eSavingsField}`,
    ).nth(0)
    this.firstSavingsCell = Selector(
      `${this.co2eSavingsField}[role='cell']`,
    ).nth(0)
    this.toggle = Selector("[data-testid='toggle-label']")
  }

  async loadingScreen() {
    //different pages use the same loading screen check
    await t
      .expect(this.loading.exists)
      .ok()
      .wait(5000)
      .expect(this.loading.exists)
      .notOk() //after 5 sec it should be loaded
  }
}

export default new Page()
