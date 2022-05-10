/*
 * © 2021 Thoughtworks, Inc.
 */
import { Selector } from 'testcafe'
import waitOn from 'wait-on'
import page from './page-model'

fixture`Cloud Carbon Footprint`.page`http://localhost:3000/`
  .before(async () => {
    await waitOn({
      resources: [
        'http://localhost:3000/',
        'http://localhost:4000/api/healthz',
      ],
    })
  })
  .beforeEach(async (t) => {
    // const header = Selector('#app-bar-header')
    await t.expect(page.header.exists).ok()
  })

test('loading screen appears when app is starting', async (t) => {
  // const loading = Selector('#loading-screen')
  await t.expect(page.loading.exists).ok()
  await t.wait(5000).expect(page.loading.exists).notOk()
})

test('main components render with correct data when app loads', async (t) => {
  //  // const cloudProviders = Selector('span').withText('Cloud Providers: 3 of 3')
  //   const accounts = Selector('span').withText('Accounts: 12 of 12')
  //   const services = Selector('span').withText('Services: 8 of 8')
  //   const lineChart = Selector('#apexchartslineChart')
  //   const carbonComparisonCard = Selector('#carbonComparisonCard')
  //   const emissionsBreakdownContainer = Selector('#emissionsBreakdownContainer')

  await t.expect(page.cloudProviders.exists).ok()
  await t.expect(page.accounts.exists).ok()
  await t.expect(page.services.exists).ok()
  await t.expect(page.lineChart.exists).ok()
  await t.expect(page.carbonComparisonCard.exists).ok()
  await t.expect(page.emissionsBreakdownContainer.exists).ok()
})

test('side drawer opens and closes when clicked', async (t) => {
  //   const drawerOpenButton = Selector('#info-button')
  //   const drawerCloseButton = Selector('#close-button-container').child(
  //     '.MuiIconButton-root',
  //   )
  //   const drawerOpen = Selector('#drawer-open').exists
  await t.click(page.drawerOpenButton).expect(page.drawerOpen.exists).ok()
  await t.click(page.drawerCloseButton).expect(page.drawerOpen.exists).notOk()
})

test('total metric tons is loaded correctly with different dropdown selections', async (t) => {
  // let totalCo2Amount = Selector('#metric-one').withText('57')
  let totalCo2Amount = page.totalCo2Amount.withText('57')
  // const cloudProviderDropDown = Selector('#cloud-provider-filter')
  //   .sibling('div')
  //   .child('button')
  // const accountsDropDown = Selector('#accounts-filter')
  //   .sibling('div')
  //   .child('button')
  // const servicesDropDown = Selector('#services-filter')
  //   .sibling('div')
  //   .child('button')

  await t.expect(totalCo2Amount.exists).ok()
  await t.click(page.cloudProviderDropDown)
  // const awsDropdownItem = Selector('#cloud-provider-filter-option-1')
  await t.click(page.awsDropdownItem)
  totalCo2Amount = page.totalCo2Amount.withText('20')
  await t.expect(totalCo2Amount.exists).ok()

  await t.click(page.accountsDropDown)
  // const accountsDropdownItem = Selector('#accounts-filter-option-1')
  await t.click(page.accountsDropdownItem)
  totalCo2Amount = page.totalCo2Amount.withText('38')
  await t.expect(totalCo2Amount.exists).ok()

  await t.click(page.servicesDropDown)
  // const servicesDropdownItem = Selector('#services-filter-option-1')
  await t.click(page.servicesDropdownItem)
  totalCo2Amount = page.totalCo2Amount.withText('34')
  await t.expect(totalCo2Amount.exists).ok()
})

test('carbon equivalency component displays each option when clicked', async (t) => {
  const flightsButton = Selector('#flights')
  const phonesButton = Selector('#phones')
  const treesButton = Selector('#trees')
  const flightsTaken = Selector('p').withText('70')
  const phonesCharged = Selector('p').withText('6.9+ M')
  const treeSeedlings = Selector('p').withText('942')

  await t.click(flightsButton).expect(flightsTaken.exists).ok()
  await t.click(phonesButton).expect(phonesCharged.exists).ok()
  await t.click(treesButton).expect(treeSeedlings.exists).ok()
})

test('emissions breakdown component displays each bar chart when selected', async (t) => {
  // Maximize the window in orde for all DOM elements to be visible.
  // For some reason this stops this test failing, and can help with debugging.
  await t.maximizeWindow()

  const dropDownSelector = Selector('#breakdown-selector')
  const accountSelection = Selector('#account-dropdown')
  const account = Selector('tspan').withText('aws account 3')

  await t.click(dropDownSelector)
  await t.click(accountSelection)
  await t.expect(account.exists).ok()

  const serviceSelection = Selector('#service-dropdown')
  const service = Selector('tspan').withText('computeEngine')

  await t.click(dropDownSelector)
  await t.click(serviceSelection)
  await t.expect(service.exists).ok()

  const regionSelection = Selector('#region-dropdown')
  const region = Selector('tspan').withText('us-east-1')

  await t.click(dropDownSelector)
  await t.click(regionSelection)
  await t.expect(region.exists).ok()
})

test('line chart displays the y-axis data when legend is clicked', async (t) => {
  const kwhLegend = Selector('span').withText('Kilowatt Hours')
  const costLegend = Selector('span').withText('Cost')
  const co2eLegend = Selector('span').withText('CO2e')
  const kwhAxis = Selector('text').withText('Kilowatt Hours (kWh)')
  const costAxis = Selector('text').withText('Cost ($)')
  const co2eAxis = Selector('text').withText('CO2e (metric tons)')

  await t.click(kwhLegend).expect(kwhAxis.exists).ok()
  await t.click(costLegend).expect(costAxis.exists).ok()
  await t.click(co2eLegend).expect(co2eAxis.exists).notOk()
})
