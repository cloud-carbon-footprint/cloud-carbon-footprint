# @cloud-carbon-footprint/app

## 0.3.0

### Minor Changes

- f3569daa: Updates emissions factor api response to include cloud provider

  For create-app template updates, please refer to [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/c19cca55d4c095d81f0bb80745580741d73405b5)

- 61332214: Adds CLI command for creating a lookup table to be used in ETL pipelines
- 52237bc6: Adds additional dashboard for viewing cloud provider recommendations including refactoring filters for reusability

  For updating the create-app templates, please refer to the following [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d1f9a94ea88e6f9210a781e16df18b9f64a0b03d).

### Patch Changes

- Updated dependencies [f3569daa]
- Updated dependencies [cee42a42]
- Updated dependencies [f2bda27a]
- Updated dependencies [61332214]
- Updated dependencies [c439b0ba]
- Updated dependencies [52237bc6]
- Updated dependencies [c81cf4bd]
  - @cloud-carbon-footprint/common@1.2.0
  - @cloud-carbon-footprint/azure@0.4.0
  - @cloud-carbon-footprint/aws@0.5.0
  - @cloud-carbon-footprint/gcp@0.4.0

## 0.2.1

### Patch Changes

- Updated dependencies [5a0aab5b]
  - @cloud-carbon-footprint/aws@0.4.0
  - @cloud-carbon-footprint/azure@0.3.1
  - @cloud-carbon-footprint/gcp@0.3.1

## 0.2.0

### Minor Changes

- f75cf08f: Adds support for getting GCP recommendations from the API
- 52a8b3c1: Adds support for specifying recommendation target for AWS via API parameter

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/404c77796ae838766dc8007e18daee2c7526f6ed) to update create app templates.

### Patch Changes

- Updated dependencies [d7fd8fda]
- Updated dependencies [af761e75]
- Updated dependencies [f75cf08f]
- Updated dependencies [52a8b3c1]
- Updated dependencies [ae7d8e19]
- Updated dependencies [22636b35]
- Updated dependencies [5407c95b]
  - @cloud-carbon-footprint/gcp@0.3.0
  - @cloud-carbon-footprint/aws@0.3.0
  - @cloud-carbon-footprint/common@1.1.0
  - @cloud-carbon-footprint/azure@0.3.0

## 0.1.0

### Minor Changes

- 13f39ac7: implements recommendations for aws rightsizing recommendations api

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/b2181a1942b0910613c8b15f97d074a7be6100b8) to update create app templates.

### Patch Changes

- 91ed3d75: Update variables GCP_BILLING_ACCOUNT_ID/GCP_BILLING_ACCOUNT_NAME to be GCP_BILLING_PROJECT_ID/GCP_BILLING_PROJECT_NAME

  This is a major update for packages: api, cli, common. Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/aab00ea5a395d94ba5ce1424ffa33abbafd7ed58) for create-app template updates as they are breaking changes.

- bbceed8b: Updates dependencies: @types/fs-extra, typescript, husky and @types/node
- Updated dependencies [13f39ac7]
- Updated dependencies [91ed3d75]
- Updated dependencies [72fc2752]
- Updated dependencies [e76d5fdd]
- Updated dependencies [bbceed8b]
  - @cloud-carbon-footprint/aws@0.2.0
  - @cloud-carbon-footprint/common@1.0.0
  - @cloud-carbon-footprint/azure@0.2.0
  - @cloud-carbon-footprint/gcp@0.2.0

## 0.0.4

### Patch Changes

- 3b42775b: Updates @types/node to 15.12.4
- Updated dependencies [a3b4f6b9]
- Updated dependencies [e93d31ec]
- Updated dependencies [bfe69180]
- Updated dependencies [3b42775b]
- Updated dependencies [53366130]
  - @cloud-carbon-footprint/aws@0.1.0
  - @cloud-carbon-footprint/azure@0.1.0
  - @cloud-carbon-footprint/gcp@0.1.0
  - @cloud-carbon-footprint/common@0.0.3

## 0.0.3

### Patch Changes

- Updated dependencies [3f283737]
- Updated dependencies [8e24c32b]
  - @cloud-carbon-footprint/gcp@0.0.3
  - @cloud-carbon-footprint/aws@0.0.3
  - @cloud-carbon-footprint/azure@0.0.3
  - @cloud-carbon-footprint/common@0.0.2

## 0.0.2

### Patch Changes

- @cloud-carbon-footprint/aws@0.0.2
- @cloud-carbon-footprint/azure@0.0.2
- @cloud-carbon-footprint/gcp@0.0.2
