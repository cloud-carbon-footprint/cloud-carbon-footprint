# @cloud-carbon-footprint/azure

## 0.8.0

### Minor Changes

- a23e1e59: Updates logic for handling unknown usage types to dynamically build kilowatt hour per usage amount (GCP, Azure) or cost (AWS) by service name and usage unit, to increase accuracy.

### Patch Changes

- Updated dependencies [a23e1e59]
- Updated dependencies [f40ce29e]
- Updated dependencies [04f2be16]
  - @cloud-carbon-footprint/core@0.15.0
  - @cloud-carbon-footprint/common@1.4.0

## 0.7.0

### Minor Changes

- aaeb61a3: Updates estimation for unknown usage types to calculate kilowatt hours first, then co2e, to improve acccuracy

### Patch Changes

- 8fd171ed: Updates a number of packages and fixes linting, typescript and dependency issues
- Updated dependencies [8fd171ed]
- Updated dependencies [808085cc]
- Updated dependencies [aaeb61a3]
  - @cloud-carbon-footprint/common@1.3.1
  - @cloud-carbon-footprint/core@0.14.0

## 0.6.0

### Minor Changes

- c29a3b53: Adds support for specifying groupBy via API param and for displaying line chart data according to data grouping

  For changes to create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8743e9a36f005716095300b7a1f331b4ffaa8100).

### Patch Changes

- c29a3b53: fixes filter logic for consumption management api
- Updated dependencies [c29a3b53]
  - @cloud-carbon-footprint/common@1.3.0
  - @cloud-carbon-footprint/core@0.13.0

## 0.5.1

### Patch Changes

- a304acb6: Upgrades version of typescript to 4.5.3
- Updated dependencies [a304acb6]
  - @cloud-carbon-footprint/common@1.2.1
  - @cloud-carbon-footprint/core@0.12.1

## 0.5.0

### Minor Changes

- 4238d3b8: changeset: Adds embodied emissions to the estimations for AWS and Azure

### Patch Changes

- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
  - @cloud-carbon-footprint/core@0.12.0

## 0.4.1

### Patch Changes

- 8b200348: Renames numberOfvCpus in ComputeUsage to match its use in ComputeEstimator
- Updated dependencies [8b200348]
  - @cloud-carbon-footprint/core@0.11.1

## 0.4.0

### Minor Changes

- cee42a42: Bumps @azure/arm-consumption dependency and updates code to support new major version
- f2bda27a: Updates implementation of Azure unknowns to seperate unsupported from unknown, and adds additional unknown usage units
- c439b0ba: implements reclassification and estimations for unknown usage rows

### Patch Changes

- Updated dependencies [f3569daa]
- Updated dependencies [61332214]
- Updated dependencies [c439b0ba]
- Updated dependencies [52237bc6]
  - @cloud-carbon-footprint/common@1.2.0
  - @cloud-carbon-footprint/core@0.11.0

## 0.3.1

### Patch Changes

- Updated dependencies [5a0aab5b]
  - @cloud-carbon-footprint/core@0.10.0

## 0.3.0

### Minor Changes

- 22636b35: updates processor coefficients

### Patch Changes

- Updated dependencies [f75cf08f]
- Updated dependencies [52a8b3c1]
  - @cloud-carbon-footprint/common@1.1.0

## 0.2.0

### Minor Changes

- e76d5fdd: Adds accountId to the Estimation Results returned from the Cloud Carbon Footprint API

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/cd2d5b988544246d87abbc441895d76003fed72b) to update create app templates.

### Patch Changes

- 91ed3d75: Update variables GCP_BILLING_ACCOUNT_ID/GCP_BILLING_ACCOUNT_NAME to be GCP_BILLING_PROJECT_ID/GCP_BILLING_PROJECT_NAME

  This is a major update for packages: api, cli, common. Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/aab00ea5a395d94ba5ce1424ffa33abbafd7ed58) for create-app template updates as they are breaking changes.

- bbceed8b: Updates dependencies: @types/fs-extra, typescript, husky and @types/node
- Updated dependencies [13f39ac7]
- Updated dependencies [91ed3d75]
- Updated dependencies [72fc2752]
- Updated dependencies [e76d5fdd]
- Updated dependencies [bbceed8b]
  - @cloud-carbon-footprint/common@1.0.0
  - @cloud-carbon-footprint/core@0.9.0

## 0.1.0

### Minor Changes

- a3b4f6b9: Completed implementation of replication factors for cloud storage seervices
- bfe69180: Updates Cascade Lake microarchitecture compute and memory coefficients based on latest rows in the SPEC Power database

### Patch Changes

- 3b42775b: Updates @types/node to 15.12.4
- 53366130: add dot env dep to common and update logger on azure
- Updated dependencies [e93d31ec]
- Updated dependencies [3b42775b]
- Updated dependencies [53366130]
  - @cloud-carbon-footprint/common@0.0.3
  - @cloud-carbon-footprint/core@0.8.2

## 0.0.3

### Patch Changes

- 8e24c32b: fixes dist directory to be added to published packages
- Updated dependencies [3f283737]
- Updated dependencies [8e24c32b]
  - @cloud-carbon-footprint/core@0.8.1
  - @cloud-carbon-footprint/common@0.0.2

## 0.0.2

### Patch Changes

- Updated dependencies [f9fbcb4c]
- Updated dependencies [c7fa7db0]
- Updated dependencies [ababb826]
- Updated dependencies [e84a4c7a]
  - @cloud-carbon-footprint/core@0.8.0
