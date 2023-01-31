# @cloud-carbon-footprint/app

## 1.1.0

### Minor Changes

- 40a8f3d1: updates cli and app for seed cache file with csp and updates create app templates
  Refer to create app changes [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/618bf389d373743212f5b6615d00ba4665c8f491) and [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/c821b98e14d6fb31e9da8319ba441b0603400c91)
- 692d6aaf: implements advisor recommendations for azure package
- 09e72585: adds include estimates variable and logic to include estimations based on csp seed value

### Patch Changes

- 222bfed3: Updates to get integration tests running locally and on CI
- Updated dependencies [b4bf5bbb]
- Updated dependencies [a1ad994d]
- Updated dependencies [692d6aaf]
- Updated dependencies [441ec2fe]
- Updated dependencies [f9123277]
- Updated dependencies [fd4ec19b]
  - @cloud-carbon-footprint/azure@1.0.0
  - @cloud-carbon-footprint/aws@0.14.1

## 1.0.0

### Major Changes

- e9e57da7: Introduces new cache management logic for performance and scalability of larger data, including option for MongoDB NoSQL database as a cache

### Minor Changes

- a6423a68: Aggregate footprint estimates for AWS resources by tags.

### Patch Changes

- a6423a68: updates ts-node dependency
- Updated dependencies [a6423a68]
- Updated dependencies [a6423a68]
- Updated dependencies [a6423a68]
- Updated dependencies [a6423a68]
- Updated dependencies [a6423a68]
- Updated dependencies [a6423a68]
  - @cloud-carbon-footprint/aws@0.14.0
  - @cloud-carbon-footprint/azure@0.12.0
  - @cloud-carbon-footprint/common@1.8.0
  - @cloud-carbon-footprint/gcp@0.11.0
  - @cloud-carbon-footprint/on-premise@0.1.1

## 0.7.0

### Minor Changes

- a7a79c83: Updates logic for cache management for better extensibility of services
- a7a79c83: updates client for new config, app for updated cache logic, and cli for seeding cache file

  client template changes located [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/5245b4b752ab4d381af58dc2db7cb57fbca9250a)
  clie template changes located [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/3568e74165e73343bfd579c544f6f3de7f3cdcec)

### Patch Changes

- Updated dependencies [a7a79c83]
- Updated dependencies [a7a79c83]
- Updated dependencies [a7a79c83]
- Updated dependencies [a7a79c83]
- Updated dependencies [a7a79c83]
- Updated dependencies [a7a79c83]
  - @cloud-carbon-footprint/aws@0.13.0
  - @cloud-carbon-footprint/azure@0.11.0
  - @cloud-carbon-footprint/common@1.7.0
  - @cloud-carbon-footprint/gcp@0.10.0

## 0.6.1

### Patch Changes

- Updated dependencies [7b9a4fc4]
- Updated dependencies [cd239fc2]
  - @cloud-carbon-footprint/azure@0.10.1
  - @cloud-carbon-footprint/common@1.6.0
  - @cloud-carbon-footprint/on-premise@0.1.0

## 0.6.0

### Minor Changes

- dcc33152: Adds support for Azure in lookup table

### Patch Changes

- Updated dependencies [dcc33152]
  - @cloud-carbon-footprint/azure@0.10.0

## 0.5.1

### Patch Changes

- ff05607b: Bumps to latest version of typescript and sets resolution for this

  See [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/6cdc1469dcd5380c9c8a84b9fe13b977991db54c) for changes to the create-app templates.

- Updated dependencies [6c590346]
- Updated dependencies [510d4b86]
- Updated dependencies [ff05607b]
  - @cloud-carbon-footprint/aws@0.11.0
  - @cloud-carbon-footprint/azure@0.9.1
  - @cloud-carbon-footprint/common@1.5.1
  - @cloud-carbon-footprint/gcp@0.9.1
  - @cloud-carbon-footprint/on-premise@0.0.2

## 0.5.0

### Minor Changes

- 7ecd432d: Adds support for optionally passing in the CCF Config into the api router
- 9938c9b0: refactors ccf for v1 implementation of on-premise estimations
  Refer to [this](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/b3ba4120d633a8b83bf8bc0c131855dd67e6a288) commit to update cli package templates.

### Patch Changes

- Updated dependencies [497ae495]
- Updated dependencies [03b43e40]
- Updated dependencies [ef6af294]
- Updated dependencies [7ecd432d]
- Updated dependencies [9fcbfc67]
- Updated dependencies [dd2b6744]
- Updated dependencies [9938c9b0]
  - @cloud-carbon-footprint/azure@0.9.0
  - @cloud-carbon-footprint/aws@0.10.0
  - @cloud-carbon-footprint/gcp@0.9.0
  - @cloud-carbon-footprint/common@1.5.0
  - @cloud-carbon-footprint/on-premise@0.0.1

## 0.4.2

### Patch Changes

- Updated dependencies [a23e1e59]
- Updated dependencies [d728b378]
- Updated dependencies [f40ce29e]
- Updated dependencies [04f2be16]
  - @cloud-carbon-footprint/aws@0.9.0
  - @cloud-carbon-footprint/azure@0.8.0
  - @cloud-carbon-footprint/gcp@0.8.0
  - @cloud-carbon-footprint/common@1.4.0

## 0.4.1

### Patch Changes

- 8fd171ed: Updates a number of packages and fixes linting, typescript and dependency issues
- Updated dependencies [cce87388]
- Updated dependencies [8fd171ed]
- Updated dependencies [808085cc]
- Updated dependencies [aaeb61a3]
- Updated dependencies [2e27711e]
  - @cloud-carbon-footprint/aws@0.8.0
  - @cloud-carbon-footprint/azure@0.7.0
  - @cloud-carbon-footprint/common@1.3.1
  - @cloud-carbon-footprint/gcp@0.7.0

## 0.4.0

### Minor Changes

- c29a3b53: Adds support for specifying groupBy via API param and for displaying line chart data according to data grouping

  For changes to create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8743e9a36f005716095300b7a1f331b4ffaa8100).

### Patch Changes

- Updated dependencies [c29a3b53]
- Updated dependencies [c29a3b53]
- Updated dependencies [c29a3b53]
  - @cloud-carbon-footprint/aws@0.7.0
  - @cloud-carbon-footprint/azure@0.6.0
  - @cloud-carbon-footprint/common@1.3.0
  - @cloud-carbon-footprint/gcp@0.6.0

## 0.3.2

### Patch Changes

- a304acb6: Upgrades version of typescript to 4.5.3
- a304acb6: Reverts using group by for cache logic to make it more accurate when grouping more than a day. Updates cache to return end day inclusive.
- Updated dependencies [a304acb6]
- Updated dependencies [a304acb6]
- Updated dependencies [a304acb6]
  - @cloud-carbon-footprint/aws@0.6.1
  - @cloud-carbon-footprint/azure@0.5.1
  - @cloud-carbon-footprint/common@1.2.1
  - @cloud-carbon-footprint/gcp@0.5.1

## 0.3.1

### Patch Changes

- 4238d3b8: Fixes bug with Create Lookup Table requiring credentials for AWS input

  For Create-App updates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/f8732281a02fe087d09343ffd4531ebe688fc655).

- 4238d3b8: Cache produces different data depending on which page is loaded

  For changes to the create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/70ae49e00e3d0bb3fd5c9e439a6a309bc9f04381)

- 4238d3b8: Removes logic that changes start/end dates to first or last of group by period, so API response is accurate
- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
  - @cloud-carbon-footprint/aws@0.6.0
  - @cloud-carbon-footprint/gcp@0.5.0
  - @cloud-carbon-footprint/azure@0.5.0

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
