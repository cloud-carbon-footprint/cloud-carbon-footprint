/*
 * © 2021 Thoughtworks, Inc.
 */
import { Selector, ClientFunction } from 'testcafe'
import waitOn from 'wait-on'
import page from './page-model'
const getLocation = ClientFunction(() => document.location.href)

fixture`Cloud Carbon Footprint Recommendations`.page`http://127.0.0.1:3000/`
  .before(async () => {
    await waitOn({
      resources: ['http://127.0.0.1:3000/'],
    })
  })
  .beforeEach(async (t) => {
    //header is present and page is recommendations

    await t.click(page.recommendationsButton)
    await t.expect(page.header.exists).ok()
    await t.expect(getLocation()).contains('recommendations')
  })

test('loading screen appears when app is starting', async (t) => {
  await page.loadingScreen
})

test('filter components render with correct data when app loads', async (t) => {
  await t.expect(page.cloudProviders.exists).ok()
  await t.expect(page.recAccounts.exists).ok() //accounts count is different for recommendations and footprint
  await t.expect(page.regions.exists).ok()
  await t.expect(page.recommendationTypes.exists).ok()
})

test('card components render with correct data when app loads', async (t) => {
  // commented out because the error message is not always present
  // await t.expect(page.errorMessage.exists).ok()
  await t.expect(page.lastThirtyDayTotal.exists).ok()
  await t.expect(page.projectedThirtyDayTotal.exists).ok()
  await t.expect(page.forecastEquivalencyCard.exists).ok()
  await t.expect(page.treeSeedlingsGrown.exists).ok()
  await t.expect(page.costSavingsPerMonth.exists).ok()
})

test('table components render with correct data when app loads', async (t) => {
  await t.expect(page.searchInput.exists).ok()
  await t.expect(page.recommendationsDataGrid.exists).ok()
})

test('toggle changes unit of measure', async (t) => {
  //check projected totals
  // commented out because the error message is not always present
  // await t.expect(page.errorMessage.exists).ok()

  await t
    .expect(page.unitOfMeasureLastThirtyDayTotal.textContent)
    .eql('Metric Tons CO2e')
  await t
    .expect(page.unitOfMeasureProjectedThirtyDayTotal.textContent)
    .eql('Metric Tons CO2e')
  await t.expect(page.co2eSavingsLastThirtyDayTotal.exists).ok()
  await t.expect(page.co2eSavingsProjectedThirtyDayTotal.exists).ok()
  await t.expect(page.costSavingsLastThirtyDayTotal.exists).ok()
  await t.expect(page.costSavingsProjectedThirtyDayTotal.exists).ok()
  //check first cell
  await t
    .expect(page.tableSavingsColumn.textContent)
    .eql('Potential Carbon Savings (t)')
  await t.expect(page.firstSavingsCell.exists).ok()
  //click kilogram toggle
  await t.click(page.toggle, { isTrusted: true })
  //recheck data in - kg instead of metric tons, so 1000
  await t
    .expect(page.unitOfMeasureLastThirtyDayTotal.textContent)
    .eql('Kilograms CO2e')
  await t
    .expect(page.unitOfMeasureProjectedThirtyDayTotal.textContent)
    .eql('Kilograms CO2e')
  await t.expect(page.co2eSavingsLastThirtyDayTotal.exists).ok()
  await t.expect(page.co2eSavingsProjectedThirtyDayTotal.exists).ok()
  await t.expect(page.costSavingsLastThirtyDayTotal.exists).ok()
  await t.expect(page.costSavingsProjectedThirtyDayTotal.exists).ok()
  await t
    .expect(page.tableSavingsColumn.textContent)
    .eql('Potential Carbon Savings (kg)')
  await t.expect(page.firstSavingsCell.exists).ok()
})
