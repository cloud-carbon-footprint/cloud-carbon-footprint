# @cloud-carbon-footprint/common

## 1.9.0

### Minor Changes

- 689c973e: Add support for Azure Tags and resource groups

### Patch Changes

- 689c973e: Adds config and default values for including individual cloud providers
- 689c973e: removes usageUnit from lookup table result
  Please refer to [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/dca81101d2b6d33beef2385faea6cf76bda3484f) for create app template updates

## 1.8.0

### Minor Changes

- a6423a68: Aggregate footprint estimates for AWS resources by tags.

### Patch Changes

- a6423a68: updates ts-node dependency
- a6423a68: Correctly calculate period end date when the local timezone switched into or out of DST during the period

## 1.7.0

### Minor Changes

- a7a79c83: Updates emissions factors for cloud provider regions

## 1.6.0

### Minor Changes

- cd239fc2: updates on-premise usage hours up time approach. Update create-app templates referenced [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/3568e74165e73343bfd579c544f6f3de7f3cdcec)

## 1.5.1

### Patch Changes

- 510d4b86: updates packages: axios googleapis dotenv @types/jest-when

  See [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8d8c1db6ff94da5127d559e10632479a8520c67a) for changes to the create-app templates.

- ff05607b: Bumps to latest version of typescript and sets resolution for this

  See [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/6cdc1469dcd5380c9c8a84b9fe13b977991db54c) for changes to the create-app templates.

## 1.5.0

### Minor Changes

- 7ecd432d: Adds support for optionally passing in the CCF Config into the api router
- 9fcbfc67: Adds option for receiving all recommendation services
- 9938c9b0: refactors ccf for v1 implementation of on-premise estimations
  Refer to [this](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/b3ba4120d633a8b83bf8bc0c131855dd67e6a288) commit to update cli package templates.

## 1.4.0

### Minor Changes

- f40ce29e: Adds Compute Optimizer Recommendations for AWS
- 04f2be16: Adds configurable option to use Google's published carbon free energy % in emissions factors. Updates estimation logic for GCP services: Cloud Composer and Kubernetes Engine, to improve accuracy.

## 1.3.1

### Patch Changes

- 8fd171ed: Updates a number of packages and fixes linting, typescript and dependency issues

## 1.3.0

### Minor Changes

- c29a3b53: Adds support for specifying groupBy via API param and for displaying line chart data according to data grouping

  For changes to create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8743e9a36f005716095300b7a1f331b4ffaa8100).

## 1.2.1

### Patch Changes

- a304acb6: Upgrades version of typescript to 4.5.3

## 1.2.0

### Minor Changes

- f3569daa: Updates emissions factor api response to include cloud provider

  For create-app template updates, please refer to [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/c19cca55d4c095d81f0bb80745580741d73405b5)

- 61332214: Adds CLI command for creating a lookup table to be used in ETL pipelines
- 52237bc6: Adds additional dashboard for viewing cloud provider recommendations including refactoring filters for reusability

  For updating the create-app templates, please refer to the following [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d1f9a94ea88e6f9210a781e16df18b9f64a0b03d).

## 1.1.0

### Minor Changes

- f75cf08f: Adds support for getting GCP recommendations from the API
- 52a8b3c1: Adds support for specifying recommendation target for AWS via API parameter

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/404c77796ae838766dc8007e18daee2c7526f6ed) to update create app templates.

## 1.0.0

### Major Changes

- 91ed3d75: Update variables GCP_BILLING_ACCOUNT_ID/GCP_BILLING_ACCOUNT_NAME to be GCP_BILLING_PROJECT_ID/GCP_BILLING_PROJECT_NAME

  This is a major update for packages: api, cli, common. Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/aab00ea5a395d94ba5ce1424ffa33abbafd7ed58) for create-app template updates as they are breaking changes.

### Minor Changes

- 13f39ac7: implements recommendations for aws rightsizing recommendations api

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/b2181a1942b0910613c8b15f97d074a7be6100b8) to update create app templates.

- 72fc2752: Removed unnecessary config option: targetRoleSessionName
- e76d5fdd: Adds accountId to the Estimation Results returned from the Cloud Carbon Footprint API

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/cd2d5b988544246d87abbc441895d76003fed72b) to update create app templates.

### Patch Changes

- bbceed8b: Updates dependencies: @types/fs-extra, typescript, husky and @types/node

## 0.0.3

### Patch Changes

- e93d31ec: Extracts common data from cloud providers
- 3b42775b: Updates @types/node to 15.12.4
- 53366130: add dot env dep to common and update logger on azure

## 0.0.2

### Patch Changes

- 8e24c32b: fixes dist directory to be added to published packages
