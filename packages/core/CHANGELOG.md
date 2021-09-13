# @cloud-carbon-footprint/core

## 0.11.0

### Minor Changes

- c439b0ba: implements reclassification and estimations for unknown usage rows
- 52237bc6: Adds additional dashboard for viewing cloud provider recommendations including refactoring filters for reusability

  For updating the create-app templates, please refer to the following [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d1f9a94ea88e6f9210a781e16df18b9f64a0b03d).

### Patch Changes

- Updated dependencies [f3569daa]
- Updated dependencies [61332214]
- Updated dependencies [52237bc6]
  - @cloud-carbon-footprint/common@1.2.0

## 0.10.0

### Minor Changes

- 5a0aab5b: implements classifying unknown usage types for aws

## 0.9.0

### Minor Changes

- 13f39ac7: implements recommendations for aws rightsizing recommendations api

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/b2181a1942b0910613c8b15f97d074a7be6100b8) to update create app templates.

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

## 0.8.2

### Patch Changes

- e93d31ec: Extracts common data from cloud providers
- 3b42775b: Updates @types/node to 15.12.4
- Updated dependencies [e93d31ec]
- Updated dependencies [3b42775b]
- Updated dependencies [53366130]
  - @cloud-carbon-footprint/common@0.0.3

## 0.8.1

### Patch Changes

- 3f283737: Adds support for regions with unknown constants
- Updated dependencies [8e24c32b]
  - @cloud-carbon-footprint/common@0.0.2

## 0.8.0

### Minor Changes

- f9fbcb4c: Updates GCPCredentials class to us the @google-cloud/iam-credentials library instead, to reduce the core package size
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

## 0.7.0

### Minor Changes

- 68365cbf: implements memory calculations for gcp
- 8df5703b: implements memory calculations for azure
- 3e2f876d: adds improvements to memory implementation for aws
- 370c509d: implements memory calculations for aws

### Patch Changes

- 56bb6da6: #244 Bug fixed by changing configs boolean conditionals:
  In order to update, you need to apply the following changes in the `client` package:

  `packages/client/src/dashboard/CarbonFormulaDrawer.tsx`:

  ```diff
      // ...

        }
      }

  -    const previousYearOfUsage = !!process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE
  +    const previousYearOfUsage =
  +        !!process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE &&
  +        process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE !== 'false'

      const appConfig: ClientConfig = {
          CURRENT_PROVIDERS: [

      // ...
  ```

- b63d8a67: The default `aws-sdk` dependency was bumped to `"^2.890.0"`,
- 3abe3dca: Adds support for AmazonNeptune storage service to AWS CostAndUSageReports
- 29f48e7c: Bug Fixed: Cache file is written with empty API data
- 7d523b59: adds default unknown processor types for azure and aws

## 0.6.1

### Patch Changes

- 021c345f: Google Cloud Storage option added to store cache file

## 0.6.0

### Minor Changes

- 8b4c992d: Add support for using the median for a group of processors when there are outliers

### Patch Changes

- 216ea2ec: adds error handling for azure request error"

## 0.5.0

### Minor Changes

- 0ccce96b: Adds additional Azure usage types and regions based on THoughtWorks' Azure usage

### Patch Changes

- 8175b41d: updates packages with readmes and metadata

## 0.4.0

### Minor Changes

- 6c620db: Updates the GCP Emissions factors to use those published by Google
- 033a504: adds integration testing
- 82aeb1e: Updates average min/max compute coefficients for cloud providers based on microarchitectures. Adds min/max compute coefficient for Graviton 2 processor

### Patch Changes

- f3d4c8a: fixes azure pue value
- c5f28fe: updates googleapis dependency version
- 906f14e: updates consumption types for azure and adds logs
- bb82d7b: updates gcp shared core processors list to enum
- 9b10f3b: fixes hdd storage types list and lint fix

## 0.3.0

### Minor Changes

- 29e9897: implements using min and max coefficients based on processor types for gcp
- 75176d7: Updates the cloud provider queries to be configurable by grouping dates and allows configurable date ranges
- ce0f249: Updates Application Config to support Docker Secrets

### Patch Changes

- beabadf: fix storage estimator and estimates cache
- e2ac070: Fixes default config for querying data
- 29e9897: adds AmazonLightsail to aws list of ssd services types
- a0ac965: Fixes failing tests when running them in a different timezone

## 0.2.0

### Minor Changes

- 96cb023: Adds support for Microsoft Azure, as well as updates to the microsite.

## 0.1.0

### Minor Changes

- 3b3bec3: Update packages to have base version
