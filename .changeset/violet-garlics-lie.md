---
'@cloud-carbon-footprint/cli': patch
---

Fixes groupBy param missing from CLI estimation request, inadvertently causing memory errors when parsing dates during estimation process.

For updates the create-app template, please see look at this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d388be0f34c0002d04edbd885b4714c36f181fab).