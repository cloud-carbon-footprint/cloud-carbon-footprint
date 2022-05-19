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
    await t.expect(page.header.exists).ok()
  })

test('loading screen appears when app is starting', async (t) => {
  await page.loadingScreen
})

test('main components render with correct data when app loads', async (t) => {
  await t.expect(page.cloudProviders.exists).ok()
  await t.expect(page.accounts.exists).ok()
  await t.expect(page.services.exists).ok()
  await t.expect(page.lineChart.exists).ok()
  await t.expect(page.carbonComparisonCard.exists).ok()
  await t.expect(page.emissionsBreakdownContainer.exists).ok()
})

test('side drawer opens and closes when clicked', async (t) => {
  await t.click(page.drawerOpenButton).expect(page.drawerOpen.exists).ok()
  await t.click(page.drawerCloseButton).expect(page.drawerOpen.exists).notOk()
})

test('total metric tons is loaded correctly with different dropdown selections', async (t) => {
  //check initial then check after each filter option
  await t.expect(page.totalCo2Amount.withText('57').exists).ok() //todo: minimize dataset-specific selectors
  await t.click(page.cloudProviderDropDown)
  await t.click(page.awsDropdownItem)
  await t.expect(page.totalCo2Amount.withText('20').exists).ok()
  await t.click(page.accountsDropDown)
  await t.click(page.accountsDropdownItem)
  await t.expect(page.totalCo2Amount.withText('38').exists).ok()
  await t.click(page.servicesDropDown)
  await t.click(page.servicesDropdownItem)
  await t.expect(page.totalCo2Amount.withText('34').exists).ok()
})

test('carbon equivalency component displays each option when clicked', async (t) => {
  await t
    .click(page.flightsButton)
    .expect(page.emissionsRecord.withText('70').exists) //todo: minimize dataset-specific selectors
    .ok()
  await t
    .click(page.phonesButton)
    .expect(page.emissionsRecord.withText('6.9+ M').exists)
    .ok()
  await t
    .click(page.treesButton)
    .expect(page.emissionsRecord.withText('942').exists)
    .ok()
})

test('emissions breakdown component displays each bar chart when selected', async (t) => {
  // Maximize the window in orde for all DOM elements to be visible.
  // For some reason this stops this test failing, and can help with debugging.
  await t.maximizeWindow()
  //sort by account
  await t.click(page.dropDownSelector)
  await t.click(page.accountSelection)
  await t.expect(page.selected.withText('aws account 3').exists).ok() //todo: minimize dataset-specific selectors

  //sort by service
  await t.click(page.dropDownSelector)
  await t.click(page.serviceSelection)
  await t.expect(page.selected.withText('computeEngine').exists).ok() //todo: minimize dataset-specific selectors

  //sort by region
  await t.click(page.dropDownSelector)
  await t.click(page.regionSelection)
  await t.expect(page.selected.withText('us-east-1').exists).ok() //todo: minimize dataset-specific selectors
})

test('line chart displays the y-axis data when legend is clicked', async (t) => {
  await t.click(page.kwhLegend).expect(page.kwhAxis.exists).ok()
  await t.click(page.costLegend).expect(page.costAxis.exists).ok()
  await t.click(page.co2eLegend).expect(page.co2eAxis.exists).notOk()
})
