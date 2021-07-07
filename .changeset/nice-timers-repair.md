---
'@cloud-carbon-footprint/api': major
'@cloud-carbon-footprint/cli': major
'@cloud-carbon-footprint/common': major
'@cloud-carbon-footprint/app': patch
'@cloud-carbon-footprint/azure': patch
'@cloud-carbon-footprint/create-app': patch
---

Update variables GCP_BILLING_ACCOUNT_ID/GCP_BILLING_ACCOUNT_NAME to be GCP_BILLING_PROJECT_ID/GCP_BILLING_PROJECT_NAME

This is a major update for packages: api, cli, common. Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/aab00ea5a395d94ba5ce1424ffa33abbafd7ed58) for create-app template updates as they are breaking changes.
