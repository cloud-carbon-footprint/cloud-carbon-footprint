/*
 * © 2022 Thoughtworks, Inc.
 */

import waitOn from 'wait-on'
import page from './page-model'

fixture`Cloud Carbon Footprint`.page`http://127.0.0.1:3000/`
  .before(async () => {
    await waitOn({
      resources: [
        'http://127.0.0.1:3000/',
        'http://127.0.0.1:4000/api/healthz',
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
  await t
    .expect(page.cloudProviders.with({ visibilityCheck: true }).exists)
    .ok() //this one was the problem once
  await t.expect(page.accounts.exists).ok()
  await t.expect(page.services.exists).ok()
  await t.expect(page.lineChart.exists).ok()
  await t.expect(page.carbonComparisonCard.exists).ok()
  await t
    .expect(
      page.emissionsBreakdownContainer.with({ visibilityCheck: true }).exists, //one of two problem elements - wait for it to be fully visible
    )
    .ok()
}) //waiting seems to help, try updating wait

test('side drawer opens and closes when clicked', async (t) => {
  await t.click(page.drawerOpenButton).expect(page.drawerOpen.exists).ok()
  await t.click(page.drawerCloseButton).expect(page.drawerOpen.exists).notOk()
})

test('total metric tons is loaded correctly with different dropdown selections', async (t) => {
  await page.totalCo2Amount.with({ visibilityCheck: true }).exists //await core element before getting any of its text-specific versions
  //check initial value then check after each filter option
  await t.expect(page.totalCo2Amount.withText('281').exists).ok() //the other problem element //todo: minimize dataset-specific selectors
  await t.click(page.cloudProviderDropDown)
  await t.click(page.awsDropdownItem)
  await t.expect(page.totalCo2Amount.withText('80').exists).ok()
  await t.click(page.accountsDropDown)
  await t.click(page.accountsDropdownItem)
  await t.expect(page.totalCo2Amount.withText('113').exists).ok()
  await t.click(page.servicesDropDown)
  await t.click(page.servicesDropdownItem)
  await t.expect(page.totalCo2Amount.withText('99').exists).ok()
})

test('carbon equivalency component displays each option when clicked', async (t) => {
  await t
    .click(page.flightsButton)
    .expect(page.emissionsRecord.withText('347').exists) //todo: minimize dataset-specific selectors
    .ok()
  await t
    .click(page.phonesButton)
    .expect(page.emissionsRecord.withText('34.2+ M').exists)
    .ok()
  await t
    .click(page.treesButton)
    .expect(page.emissionsRecord.withText('4,646').exists)
    .ok()
})

test('emissions breakdown component displays each bar chart when selected', async (t) => {
  // Maximize the window in orde for all DOM elements to be visible.
  // For some reason this stops this test failing, and can help with debugging.
  // In headless mode, issues have been noted that can be resolved by resizing window: https://github.com/DevExpress/testcafe/issues/6739
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
  await t.maximizeWindow()
  await t.click(page.dropDownSelector)
  await t.click(page.regionSelection)
  await t.expect(page.selected.withText('us-east-1').exists).ok() //todo: minimize dataset-specific selectors
})

test('line chart displays the y-axis data when legend is clicked', async (t) => {
  await t.click(page.kwhLegend).expect(page.kwhAxis.exists).ok()
  await t.click(page.costLegend).expect(page.costAxis.exists).ok()
  await t.click(page.co2eLegend).expect(page.co2eAxis.exists).notOk()
})
