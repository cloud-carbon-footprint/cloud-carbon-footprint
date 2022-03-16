# @cloud-carbon-footprint/aws

## 0.10.0

### Minor Changes

- ef6af294: Adds initial support for energy/carbon estimation for GPU instances for AWS and GCP
- 9fcbfc67: Adds option for receiving all recommendation services

### Patch Changes

- 03b43e40: Moves f1 and inf1 instances out of the GPU_INSTANCES_TYPES array, because those families don't have GPUs
- dd2b6744: Adds check for total running queries in Lambda implementation, with a back off, to avoid hitting concurrent queriy limits
- Updated dependencies [497ae495]
- Updated dependencies [ef6af294]
- Updated dependencies [7ecd432d]
- Updated dependencies [9fcbfc67]
- Updated dependencies [9938c9b0]
  - @cloud-carbon-footprint/core@0.16.0
  - @cloud-carbon-footprint/common@1.5.0

## 0.9.1

### Patch Changes

- 4873fa2f: Adds reference link for aws instance types

## 0.9.0

### Minor Changes

- a23e1e59: Updates logic for handling unknown usage types to dynamically build kilowatt hour per usage amount (GCP, Azure) or cost (AWS) by service name and usage unit, to increase accuracy.
- f40ce29e: Adds Compute Optimizer Recommendations for AWS

### Patch Changes

- d728b378: Restructures AWS Recommendations directory and updates all corresponding files
- Updated dependencies [a23e1e59]
- Updated dependencies [f40ce29e]
- Updated dependencies [04f2be16]
  - @cloud-carbon-footprint/core@0.15.0
  - @cloud-carbon-footprint/common@1.4.0

## 0.8.0

### Minor Changes

- aaeb61a3: Updates estimation for unknown usage types to calculate kilowatt hours first, then co2e, to improve acccuracy

### Patch Changes

- cce87388: Removes suffix from aws usage type
- 8fd171ed: Updates a number of packages and fixes linting, typescript and dependency issues
- 2e27711e: adds HostBoxUsage to unsupported usage types in aws to not double count
- Updated dependencies [8fd171ed]
- Updated dependencies [808085cc]
- Updated dependencies [aaeb61a3]
  - @cloud-carbon-footprint/common@1.3.1
  - @cloud-carbon-footprint/core@0.14.0

## 0.7.0

### Minor Changes

- c29a3b53: Adds support for specifying groupBy via API param and for displaying line chart data according to data grouping

  For changes to create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8743e9a36f005716095300b7a1f331b4ffaa8100).

### Patch Changes

- c29a3b53: Fixes instance family logic when calculating embodied emissions
- Updated dependencies [c29a3b53]
  - @cloud-carbon-footprint/common@1.3.0
  - @cloud-carbon-footprint/core@0.13.0

## 0.6.1

### Patch Changes

- a304acb6: Upgrades version of typescript to 4.5.3
- Updated dependencies [a304acb6]
  - @cloud-carbon-footprint/common@1.2.1
  - @cloud-carbon-footprint/core@0.12.1

## 0.6.0

### Minor Changes

- 4238d3b8: Bug fix in core package to handle no estimates and implementation of terraform deployments for aws
- 4238d3b8: changeset: Adds embodied emissions to the estimations for AWS and Azure

### Patch Changes

- 4238d3b8: Fixes bug with Create Lookup Table requiring credentials for AWS input

  For Create-App updates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/f8732281a02fe087d09343ffd4531ebe688fc655).

- 4238d3b8: updates aws high fidelity approach to display account names
- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
  - @cloud-carbon-footprint/core@0.12.0

## 0.5.1

### Patch Changes

- 8b200348: Renames numberOfvCpus in ComputeUsage to match its use in ComputeEstimator
- Updated dependencies [8b200348]
  - @cloud-carbon-footprint/core@0.11.1

## 0.5.0

### Minor Changes

- 61332214: Adds CLI command for creating a lookup table to be used in ETL pipelines
- 52237bc6: Adds additional dashboard for viewing cloud provider recommendations including refactoring filters for reusability

  For updating the create-app templates, please refer to the following [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d1f9a94ea88e6f9210a781e16df18b9f64a0b03d).

### Patch Changes

- Updated dependencies [f3569daa]
- Updated dependencies [61332214]
- Updated dependencies [c439b0ba]
- Updated dependencies [52237bc6]
  - @cloud-carbon-footprint/common@1.2.0
  - @cloud-carbon-footprint/core@0.11.0

## 0.4.0

### Minor Changes

- 5a0aab5b: implements classifying unknown usage types for aws

### Patch Changes

- Updated dependencies [5a0aab5b]
  - @cloud-carbon-footprint/core@0.10.0

## 0.3.0

### Minor Changes

- 52a8b3c1: Adds support for specifying recommendation target for AWS via API parameter

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/404c77796ae838766dc8007e18daee2c7526f6ed) to update create app templates.

- 22636b35: updates processor coefficients

### Patch Changes

- af761e75: Bugfix: updates region mapping for AWS Recommendations to be correct based on responses from the API
- f75cf08f: Adds support for getting GCP recommendations from the API
- ae7d8e19: Fixes bug where AWS r5 instances were estimates emissions incorrectly, due to missing RAM constants and incorrect key from CUR data
- Updated dependencies [f75cf08f]
- Updated dependencies [52a8b3c1]
  - @cloud-carbon-footprint/common@1.1.0

## 0.2.0

### Minor Changes

- 13f39ac7: implements recommendations for aws rightsizing recommendations api

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/b2181a1942b0910613c8b15f97d074a7be6100b8) to update create app templates.

- 72fc2752: Removed unnecessary config option: targetRoleSessionName
- e76d5fdd: Adds accountId to the Estimation Results returned from the Cloud Carbon Footprint API

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/cd2d5b988544246d87abbc441895d76003fed72b) to update create app templates.

### Patch Changes

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
