/*
 * © 2021 Thoughtworks, Inc.
 */
import { Selector, ClientFunction } from 'testcafe'
import waitOn from 'wait-on'
import page from './page-model'
const getLocation = ClientFunction(() => document.location.href)

fixture`Cloud Carbon Footprint Recommendations`.page`http://localhost:3000/`
  .before(async () => {
    await waitOn({
      resources: ['http://localhost:3000/'],
    })
  })
  .beforeEach(async (t) => {
    const recommendationsButton = Selector('a').withText('RECOMMENDATIONS')
    await t.click(recommendationsButton)
    // const header = Selector('#app-bar-header')
    await t.expect(page.header.exists).ok()
    await t.expect(getLocation()).contains('recommendations')
  })

test('loading screen appears when app is starting', async (t) => {
  // const loading = Selector('#loading-screen')
  // await t.expect(loading.exists).ok()
  // await t.wait(5000).expect(loading.exists).notOk()
  await page.loadingScreen
})

test('filter components render with correct data when app loads', async (t) => {
  // const cloudProviders = Selector('span').withText('Cloud Providers: 3 of 3')
  // const accounts = Selector('span').withText('Accounts: 10 of 10')
  // const regions = Selector('span').withText('Regions: 8 of 8')
  // const recommendationTypes = Selector('span').withText(
  //   'Recommendation Types: 8 of 8',
  // )

  await t.expect(page.cloudProviders.exists).ok()
  await t.expect(page.recAccounts.exists).ok() //accounts count is different for recommendations and footprint
  await t.expect(page.regions.exists).ok()
  await t.expect(page.recommendationTypes.exists).ok()
})

test('card components render with correct data when app loads', async (t) => {
  const lastThirtyDayTotal = Selector(
    "[data-testid='forecast-card-last-thirty-day-total']",
  )
  const projectedThirtyDayTotal = Selector(
    "[data-testid='forecast-card-projected-thirty-day-total']",
  )
  const forecastEquivalencyCard = Selector(
    "[data-testid='forecast-equivalency-card']",
  )
  const treeSeedlingsGrown = Selector("[data-testid='tree-seedlings-grown']")
  const costSavingsPerMonth = Selector("[data-testid='cost-savings-per-month']")

  await t.expect(lastThirtyDayTotal.exists).ok()
  await t.expect(projectedThirtyDayTotal.exists).ok()
  await t.expect(forecastEquivalencyCard.exists).ok()
  await t.expect(treeSeedlingsGrown.textContent).eql('1,037')
  await t.expect(costSavingsPerMonth.textContent).eql('$69.01')
})

test('table components render with correct data when app loads', async (t) => {
  const searchInput = Selector("[data-testid='search-input']")
  const recommendationsDataGrid = Selector(
    "[data-testid='recommendations-data-grid']",
  )

  await t.expect(searchInput.exists).ok()
  await t.expect(recommendationsDataGrid.exists).ok()
})

test('toggle changes unit of measure', async (t) => {
  const unitOfMeasureLastThirtyDayTotal = Selector(
    "[data-testid='unit-of-measure-last-thirty-day-total']",
  )
  const unitOfMeasureProjectedThirtyDayTotal = Selector(
    "[data-testid='unit-of-measure-projected-thirty-day-total']",
  )
  const co2eSavingsLastThirtyDayTotal = Selector(
    "[data-testid='co2e-savings-last-thirty-day-total'",
  )
  const co2eSavingsProjectedThirtyDayTotal = Selector(
    "[data-testid='co2e-savings-projected-thirty-day-total'",
  )
  const costSavingsLastThirtyDayTotal = Selector(
    "[data-testid='cost-savings-last-thirty-day-total'",
  )
  const costSavingsProjectedThirtyDayTotal = Selector(
    "[data-testid='cost-savings-projected-thirty-day-total'",
  )
  const tableSavingsColumn = Selector(
    "[role='columnheader'][data-field='co2eSavings']",
  ).nth(0)
  const firstSavingsCell = Selector(
    "[role='cell'][data-field='co2eSavings']",
  ).nth(0)
  const toggle = Selector("[data-testid='toggle-label']")

  await t
    .expect(unitOfMeasureLastThirtyDayTotal.textContent)
    .eql('Metric Tons CO2e')
  await t
    .expect(unitOfMeasureProjectedThirtyDayTotal.textContent)
    .eql('Metric Tons CO2e')
  await t.expect(co2eSavingsLastThirtyDayTotal.textContent).eql('0')
  await t.expect(co2eSavingsProjectedThirtyDayTotal.textContent).eql('0')
  await t.expect(costSavingsLastThirtyDayTotal.textContent).eql('$0')
  await t.expect(costSavingsProjectedThirtyDayTotal.textContent).eql('$0')
  await t
    .expect(tableSavingsColumn.textContent)
    .eql('Potential Carbon Savings (t)')
  await t.expect(firstSavingsCell.textContent).eql('11.492')
  await t.click(toggle, { isTrusted: true })
  await t
    .expect(unitOfMeasureLastThirtyDayTotal.textContent)
    .eql('Kilograms CO2e')
  await t
    .expect(unitOfMeasureProjectedThirtyDayTotal.textContent)
    .eql('Kilograms CO2e')
  await t.expect(co2eSavingsLastThirtyDayTotal.textContent).eql('0')
  await t.expect(co2eSavingsProjectedThirtyDayTotal.textContent).eql('0')
  await t.expect(costSavingsLastThirtyDayTotal.textContent).eql('$0')
  await t.expect(costSavingsProjectedThirtyDayTotal.textContent).eql('$0')
  await t
    .expect(tableSavingsColumn.textContent)
    .eql('Potential Carbon Savings (kg)')
  await t.expect(firstSavingsCell.textContent).eql('11492')
})
