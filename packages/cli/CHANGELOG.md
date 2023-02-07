# @cloud-carbon-footprint/cli

## 1.9.1

### Patch Changes

- 689c973e: removes usageUnit from lookup table result
  Please refer to [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/dca81101d2b6d33beef2385faea6cf76bda3484f) for create app template updates
- Updated dependencies [689c973e]
- Updated dependencies [689c973e]
- Updated dependencies [689c973e]
  - @cloud-carbon-footprint/common@1.9.0

## 1.9.0

### Minor Changes

- 40a8f3d1: updates cli and app for seed cache file with csp and updates create app templates
  Refer to create app changes [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/618bf389d373743212f5b6615d00ba4665c8f491) and [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/c821b98e14d6fb31e9da8319ba441b0603400c91)
- a1ad994d: Updates Azure SDK and usageRow pagination to latest version (v9)

  For updates to create-app (CLI) templates, please review this [commit.](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/6e943bc74851b093d372b14ccb38981053e36bf5)

### Patch Changes

- 381b7872: Fixes groupBy param missing from CLI estimation request, inadvertently causing memory errors when parsing dates during estimation process.

  For updates the create-app template, please see look at this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d388be0f34c0002d04edbd885b4714c36f181fab).

- Updated dependencies [40a8f3d1]
- Updated dependencies [692d6aaf]
- Updated dependencies [09e72585]
- Updated dependencies [222bfed3]
  - @cloud-carbon-footprint/app@1.1.0

## 1.8.0

### Minor Changes

- a6423a68: Includes updates for pagination logic and mongodb implementation, as well as date range fixes and tagging logic

### Patch Changes

- a6423a68: updates ts-node dependency
- a6423a68: updates cli on prem validation - please refer to [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/fd4843c3954d7f28723f2ebeffef7f3bb90e4f0b)
- Updated dependencies [a6423a68]
- Updated dependencies [a6423a68]
- Updated dependencies [a6423a68]
- Updated dependencies [e9e57da7]
  - @cloud-carbon-footprint/app@1.0.0
  - @cloud-carbon-footprint/common@1.8.0

## 1.7.0

### Minor Changes

- a7a79c83: updates client for new config, app for updated cache logic, and cli for seeding cache file

  client template changes located [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/5245b4b752ab4d381af58dc2db7cb57fbca9250a)
  clie template changes located [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/3568e74165e73343bfd579c544f6f3de7f3cdcec)

### Patch Changes

- Updated dependencies [a7a79c83]
- Updated dependencies [a7a79c83]
- Updated dependencies [a7a79c83]
  - @cloud-carbon-footprint/app@0.7.0
  - @cloud-carbon-footprint/common@1.7.0

## 1.6.0

### Minor Changes

- cd239fc2: updates on-premise usage hours up time approach. Update create-app templates referenced [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/3568e74165e73343bfd579c544f6f3de7f3cdcec)

### Patch Changes

- Updated dependencies [cd239fc2]
  - @cloud-carbon-footprint/common@1.6.0
  - @cloud-carbon-footprint/app@0.6.1

## 1.5.0

### Minor Changes

- 6178cb7a: Adds support for Azure in the Lookup Table

### Patch Changes

- Updated dependencies [dcc33152]
  - @cloud-carbon-footprint/app@0.6.0

## 1.4.1

### Patch Changes

- 510d4b86: updates packages: axios googleapis dotenv @types/jest-when

  See [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8d8c1db6ff94da5127d559e10632479a8520c67a) for changes to the create-app templates.

- ff05607b: Bumps to latest version of typescript and sets resolution for this

  See [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/6cdc1469dcd5380c9c8a84b9fe13b977991db54c) for changes to the create-app templates.

- Updated dependencies [510d4b86]
- Updated dependencies [ff05607b]
  - @cloud-carbon-footprint/common@1.5.1
  - @cloud-carbon-footprint/app@0.5.1

## 1.4.0

### Minor Changes

- 9938c9b0: refactors ccf for v1 implementation of on-premise estimations
  Refer to [this](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/b3ba4120d633a8b83bf8bc0c131855dd67e6a288) commit to update cli package templates.

### Patch Changes

- Updated dependencies [7ecd432d]
- Updated dependencies [9fcbfc67]
- Updated dependencies [9938c9b0]
  - @cloud-carbon-footprint/app@0.5.0
  - @cloud-carbon-footprint/common@1.5.0

## 1.3.0

### Minor Changes

- 04f2be16: Adds configurable option to use Google's published carbon free energy % in emissions factors. Updates estimation logic for GCP services: Cloud Composer and Kubernetes Engine, to improve accuracy.

### Patch Changes

- Updated dependencies [f40ce29e]
- Updated dependencies [04f2be16]
  - @cloud-carbon-footprint/common@1.4.0
  - @cloud-carbon-footprint/app@0.4.2

## 1.2.1

### Patch Changes

- 8fd171ed: Updates a number of packages and fixes linting, typescript and dependency issues
- Updated dependencies [8fd171ed]
  - @cloud-carbon-footprint/app@0.4.1
  - @cloud-carbon-footprint/common@1.3.1

## 1.2.0

### Minor Changes

- c29a3b53: Adds support for specifying groupBy via API param and for displaying line chart data according to data grouping

  For changes to create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8743e9a36f005716095300b7a1f331b4ffaa8100).

### Patch Changes

- Updated dependencies [c29a3b53]
  - @cloud-carbon-footprint/app@0.4.0
  - @cloud-carbon-footprint/common@1.3.0

## 1.1.2

### Patch Changes

- a304acb6: Upgrades version of typescript to 4.5.3
- a304acb6: Updates scope 3 emissions coefficients for Machine Types for GCP
- Updated dependencies [a304acb6]
- Updated dependencies [a304acb6]
  - @cloud-carbon-footprint/app@0.3.2
  - @cloud-carbon-footprint/common@1.2.1

## 1.1.1

### Patch Changes

- 4238d3b8: Fixes bug with Create Lookup Table requiring credentials for AWS input

  For Create-App updates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/f8732281a02fe087d09343ffd4531ebe688fc655).

- 4238d3b8: "Add embodied emissions to the estimations for GCP"
- 4238d3b8: changeset: Adds embodied emissions to the estimations for AWS and Azure
- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
  - @cloud-carbon-footprint/app@0.3.1

## 1.1.0

### Minor Changes

- 61332214: Adds CLI command for creating a lookup table to be used in ETL pipelines
- 52237bc6: Adds additional dashboard for viewing cloud provider recommendations including refactoring filters for reusability

  For updating the create-app templates, please refer to the following [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d1f9a94ea88e6f9210a781e16df18b9f64a0b03d).

### Patch Changes

- Updated dependencies [f3569daa]
- Updated dependencies [61332214]
- Updated dependencies [52237bc6]
  - @cloud-carbon-footprint/app@0.3.0
  - @cloud-carbon-footprint/common@1.2.0

## 1.0.2

### Patch Changes

- @cloud-carbon-footprint/app@0.2.1

## 1.0.1

### Patch Changes

- 52a8b3c1: Adds support for specifying recommendation target for AWS via API parameter

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/404c77796ae838766dc8007e18daee2c7526f6ed) to update create app templates.

- Updated dependencies [f75cf08f]
- Updated dependencies [52a8b3c1]
  - @cloud-carbon-footprint/app@0.2.0
  - @cloud-carbon-footprint/common@1.1.0

## 1.0.0

### Major Changes

- 91ed3d75: Update variables GCP_BILLING_ACCOUNT_ID/GCP_BILLING_ACCOUNT_NAME to be GCP_BILLING_PROJECT_ID/GCP_BILLING_PROJECT_NAME

  This is a major update for packages: api, cli, common. Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/aab00ea5a395d94ba5ce1424ffa33abbafd7ed58) for create-app template updates as they are breaking changes.

### Patch Changes

- bbceed8b: Updates dependencies: @types/fs-extra, typescript, husky and @types/node
- Updated dependencies [13f39ac7]
- Updated dependencies [91ed3d75]
- Updated dependencies [72fc2752]
- Updated dependencies [e76d5fdd]
- Updated dependencies [bbceed8b]
  - @cloud-carbon-footprint/app@0.1.0
  - @cloud-carbon-footprint/common@1.0.0

## 0.4.2

### Patch Changes

- 3b42775b: Updates @types/node to 15.12.4
- Updated dependencies [e93d31ec]
- Updated dependencies [3b42775b]
- Updated dependencies [53366130]
  - @cloud-carbon-footprint/common@0.0.3
  - @cloud-carbon-footprint/app@0.0.4

## 0.4.1

### Patch Changes

- Updated dependencies [8e24c32b]
  - @cloud-carbon-footprint/common@0.0.2
  - @cloud-carbon-footprint/app@0.0.3

## 0.4.0

### Minor Changes

- ababb826: Extracts two new packages app and common to avoid circular dependancies and make it easier to extract cloud provider packages
- e84a4c7a: Extract logic into the new packages: app, common, gcp, aws, azure:

  There are many files that have been updated/extracted.
  In order to update create-app templates, refer to the follow [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8c6aaed52e9f3949e134852986d50362aad3367a).

  The following changes were made to,
  'packages/create-app/templates/default-app/packages/client/tsconfig.json':

  ```diff
      // ...
          "skipLibCheck": true,
          "esModuleInterop": true,
          "allowSyntheticDefaultImports": true,
  -        "strict": true,
          "forceConsistentCasingInFileNames": true,
          "module": "esnext",
          "moduleResolution": "node",
          "resolveJsonModule": true,
  -        "isolatedModules": true,
          "noEmit": true,
          "jsx": "react-jsx",
  -        "noFallthroughCasesInSwitch": true
  +        "noFallthroughCasesInSwitch": true,
  +        "strict": false,
  +        "isolatedModules": true
        },
  -      "include": [
  -        "src",
  -        "node_modules/apexcharts/types/apexcharts.d.ts"
  -      ]
  +      "include": ["src"]
      }
      // ...
  ```

  Additionally, the following dependencies have been updated and should also be updated in their respective template package.json file:

  - @cloud-carbon-footprint root package.json:
    - "@types/fs-extra": "^9.0.11"
    - "concurrently": "^6.2.0"
    - "marked": ">=2.0.5"
  - @cloud-carbon-footprint/api and @cloud-carbon-footprint/cli:
    - "dotenv": "^10.0.0"
    - "@cloud-carbon-footprint/app": Can be added with `yarn up @cloud-carbon-footprint/app`
    - "@cloud-carbon-footprint/common": Can be added with `yarn up @cloud-carbon-footprint/common`
  - @cloud-carbon-footprint/client:
    - "dotenv": "^10.0.0"
    - "@testing-library/react-hooks": "^7.0.0"
    - "concurrently": "^6.2.0"
    - "@cloud-carbon-footprint/common": Can be added with `yarn up @cloud-carbon-footprint/common`

### Patch Changes

- c7fa7db0: Updates dependencies to the latest
- Updated dependencies [f9fbcb4c]
- Updated dependencies [c7fa7db0]
- Updated dependencies [ababb826]
- Updated dependencies [e84a4c7a]
  - @cloud-carbon-footprint/core@0.8.0

## 0.3.3

### Patch Changes

- b63d8a67: The default `aws-sdk` dependency was bumped to `"^2.890.0"`,
- Updated dependencies [56bb6da6]
- Updated dependencies [68365cbf]
- Updated dependencies [b63d8a67]
- Updated dependencies [8df5703b]
- Updated dependencies [3e2f876d]
- Updated dependencies [3abe3dca]
- Updated dependencies [29f48e7c]
- Updated dependencies [370c509d]
- Updated dependencies [7d523b59]
  - @cloud-carbon-footprint/core@0.7.0

## 0.3.2

### Patch Changes

- 81dfde6c: Improves .env.template files with links to cofiguration glossary
- b0151b7d: Improves GCP guided-install prompts in the CLI and create-app packages
- Updated dependencies [8b4c992d]
- Updated dependencies [216ea2ec]
  - @cloud-carbon-footprint/core@0.6.0

## 0.3.1

### Patch Changes

- 8175b41d: updates packages with readmes and metadata
- Updated dependencies [8175b41d]
- Updated dependencies [0ccce96b]
  - @cloud-carbon-footprint/core@0.5.0

## 0.3.0

### Minor Changes

- 23d841e: Adds support for guided install command in the cli package.

### Patch Changes

- Updated dependencies [6c620db]
- Updated dependencies [f3d4c8a]
- Updated dependencies [c5f28fe]
- Updated dependencies [906f14e]
- Updated dependencies [bb82d7b]
- Updated dependencies [033a504]
- Updated dependencies [9b10f3b]
- Updated dependencies [82aeb1e]
  - @cloud-carbon-footprint/core@0.4.0

## 0.2.1

### Patch Changes

- a0ac965: Fixes failing tests when running them in a different timezone
- Updated dependencies [beabadf]
- Updated dependencies [e2ac070]
- Updated dependencies [29e9897]
- Updated dependencies [75176d7]
- Updated dependencies [ce0f249]
- Updated dependencies [29e9897]
- Updated dependencies [a0ac965]
  - @cloud-carbon-footprint/core@0.3.0

## 0.2.0

### Minor Changes

- 96cb023: Adds support for Microsoft Azure, as well as updates to the microsite.

### Patch Changes

- Updated dependencies [96cb023]
  - @cloud-carbon-footprint/core@0.2.0

## 0.1.0

### Minor Changes

- 3b3bec3: Update packages to have base version
