/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
import { Selector } from 'testcafe'

fixture`Cloud Carbon Footprint`.page`http://localhost:3000/`

test('loading screen appears when app is starting', async (t) => {
  const loading = Selector('#loading-screen')
  await t.expect(loading.exists).ok()
  await t.wait(5000).expect(loading.exists).notOk()
})

test('main components render with correct data when app loads', async (t) => {
  const cloudProviders = Selector('span').withText('Cloud Providers: 3 of 3')
  const accounts = Selector('span').withText('Accounts: 20 of 20')
  const services = Selector('span').withText('Services: 8 of 8')
  const lineChart = Selector('#apexchartslineChart')
  const carbonComparisonCard = Selector('#carbonComparisonCard')
  const emissionsBreakdownContainer = Selector('#emissionsBreakdownContainer')

  await t.click(cloudProviders).expect(cloudProviders.exists).ok()
  await t.expect(accounts.exists).ok()
  await t.expect(services.exists).ok()
  await t.expect(lineChart.exists).ok()
  await t.expect(carbonComparisonCard.exists).ok()
  await t.expect(emissionsBreakdownContainer.exists).ok()
})

test('side drawer opens and closes when clicked', async (t) => {
  const drawerOpenButton = Selector('#info-button')
  const drawerCloseButton = Selector('#close-button-container').child(
    '.MuiIconButton-root',
  )
  const drawerOpen = Selector('#drawer-open').exists

  await t.click(drawerOpenButton).expect(drawerOpen).ok()
  await t.click(drawerCloseButton).expect(drawerOpen).notOk()
})

test('total metric tons is loaded correctly with different dropdown selections', async (t) => {
  let totalCo2Amount = Selector('#metric-one').withText('286')
  const cloudProviderDropDown = Selector('#cloud-provider-filter')
    .sibling('div')
    .child('button')
  const accountsDropDown = Selector('#accounts-filter')
    .sibling('div')
    .child('button')
  const servicesDropDown = Selector('#services-filter')
    .sibling('div')
    .child('button')

  await t.click(totalCo2Amount).expect(totalCo2Amount.exists).ok()
  await t.click(cloudProviderDropDown)
  const awsDropdownItem = Selector('#cloud-provider-filter-option-1')
  await t.click(awsDropdownItem)
  totalCo2Amount = Selector('#metric-one').withText('80')
  await t.expect(totalCo2Amount.exists).ok()

  await t.click(accountsDropDown)
  const accountsDropdownItem = Selector('#accounts-filter-option-1')
  await t.click(accountsDropdownItem)
  totalCo2Amount = Selector('#metric-one').withText('136')
  await t.expect(totalCo2Amount.exists).ok()

  await t.click(servicesDropDown)
  const servicesDropdownItem = Selector('#services-filter-option-1')
  await t.click(servicesDropdownItem)
  totalCo2Amount = Selector('#metric-one').withText('124')
  await t.expect(totalCo2Amount.exists).ok()
})

test('carbon equivalency component displays each option when clicked', async (t) => {
  const gasButton = Selector('#gas')
  const treesButton = Selector('#trees')
  const milesButton = Selector('#miles')
  const gallonsOfGas = Selector('p').withText('32,182')
  const treeSeedlings = Selector('p').withText('4,729')
  const milesDriven = Selector('p').withText('709,678')

  await t.click(gasButton).expect(gallonsOfGas.exists).ok()
  await t.click(treesButton).expect(treeSeedlings.exists).ok()
  await t.click(milesButton).expect(milesDriven.exists).ok()
})

test('emissions breakdown component displays each bar chart when selected', async (t) => {
  const dropDownSelector = Selector('#breakdown-selector')
  const regionSelection = Selector('#region-dropdown')
  const accountSelection = Selector('#account-dropdown')
  const serviceSelection = Selector('#service-dropdown')
  const region = Selector('tspan').withText('us-east-1')
  const account = Selector('tspan').withText('aws account 3')
  const service = Selector('tspan').withText('computeEngine')

  await t
    .click(dropDownSelector)
    .click(accountSelection)
    .expect(account.exists)
    .ok()
  await t
    .click(dropDownSelector)
    .click(regionSelection)
    .expect(region.exists)
    .ok()
  await t
    .click(dropDownSelector)
    .click(serviceSelection)
    .expect(service.exists)
    .ok()
})

test('line chart displays the y-axis data when legend is clicked', async (t) => {
  const kwhLegend = Selector('span').withText('Kilowatt Hours')
  const costLegend = Selector('span').withText('Cost')
  const co2eLegend = Selector('span').withText('CO2e')
  const kwhAxis = Selector('text').withText('kilowatt hours (kWh)')
  const costAxis = Selector('text').withText('Cost ($)')
  const co2eAxis = Selector('text').withText('CO2e (metric tons)')

  await t.click(kwhLegend).expect(kwhAxis.exists).ok()
  await t.click(costLegend).expect(costAxis.exists).ok()
  await t.click(co2eLegend).expect(co2eAxis.exists).notOk()
})
