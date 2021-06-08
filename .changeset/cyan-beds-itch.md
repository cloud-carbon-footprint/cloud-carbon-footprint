---
'@cloud-carbon-footprint/client': minor
'@cloud-carbon-footprint/create-app': patch
---

Adds Carbon Intensity Map for each cloud provider to the dashboard

There are many files that have been added to the client package.
In order to update the create-app templates, refer to the follow commits:

- [a4bd92c](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/174c7b0229bf8d9b7ec37cb562ff2eac5ef45759)
- [174c7b0](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/994cd3e4ebe86ba575c232e5092141a82b588e1b)

The following change was made to the `packages/create-app/templates/default-app/packages/client/dashboard/CloudCarbonContainer` file:

```diff
    import { FilterResultResponse } from '../models/types'
    import NoDataPage from './NoDataPage'
    import config from '../ConfigLoader'
+   import { CarbonIntensityMap } from './CarbonIntensityMap/CarbonIntensityMap'

    const PADDING_FILTER = 0.5
    const PADDING_LOADING = 2

    // …

                        </Grid>
                      </Grid>
                    </Grid>
+                    <Grid item xs={12}>
+                      <CarbonIntensityMap />
+                    </Grid>
                  </Grid>
                </Grid>
                </div>

    // …

```
