/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
import { Selector } from 'testcafe'

fixture`MyFixture`.page`http://localhost:3000/`

test('Click test', async (t) => {
  const drawerClose = Selector('.makeStyles-infoButton-2')
  const drawerOpen = Selector('.makeStyles-drawerOpen-5').exists

  await t.click(drawerClose).expect(drawerOpen).ok()
})
