# @cloud-carbon-footprint/api

## 1.6.0

### Minor Changes

- 689c973e: Add support for Azure Tags and resource groups

### Patch Changes

- Updated dependencies [689c973e]
- Updated dependencies [689c973e]
- Updated dependencies [689c973e]
  - @cloud-carbon-footprint/common@1.9.0

## 1.5.1

### Patch Changes

- c1684f40: updates for handling CORS. Please refer to create app template updates [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/9afbcf704797f20867b54c6a627415674f49db96)
- Updated dependencies [40a8f3d1]
- Updated dependencies [692d6aaf]
- Updated dependencies [09e72585]
- Updated dependencies [222bfed3]
  - @cloud-carbon-footprint/app@1.1.0

## 1.5.0

### Minor Changes

- 24c76730: Introduces new cache management logic for performance and scalability of larger data, including option for MongoDB NoSQL database as a cache
- a6423a68: Includes updates for pagination logic and mongodb implementation, as well as date range fixes and tagging logic

### Patch Changes

- Updated dependencies [a6423a68]
- Updated dependencies [a6423a68]
- Updated dependencies [a6423a68]
- Updated dependencies [e9e57da7]
  - @cloud-carbon-footprint/app@1.0.0
  - @cloud-carbon-footprint/common@1.8.0

## 1.4.3

### Patch Changes

- Updated dependencies [a7a79c83]
- Updated dependencies [a7a79c83]
- Updated dependencies [a7a79c83]
  - @cloud-carbon-footprint/app@0.7.0
  - @cloud-carbon-footprint/common@1.7.0

## 1.4.2

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

- 7ecd432d: Adds support for optionally passing in the CCF Config into the api router

### Patch Changes

- Updated dependencies [7ecd432d]
- Updated dependencies [9fcbfc67]
- Updated dependencies [9938c9b0]
  - @cloud-carbon-footprint/app@0.5.0
  - @cloud-carbon-footprint/common@1.5.0

## 1.3.1

### Patch Changes

- 8fd171ed: Updates a number of packages and fixes linting, typescript and dependency issues
- Updated dependencies [8fd171ed]
  - @cloud-carbon-footprint/app@0.4.1
  - @cloud-carbon-footprint/common@1.3.1

## 1.3.0

### Minor Changes

- c29a3b53: Adds support for specifying groupBy via API param and for displaying line chart data according to data grouping

  For changes to create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8743e9a36f005716095300b7a1f331b4ffaa8100).

### Patch Changes

- Updated dependencies [c29a3b53]
  - @cloud-carbon-footprint/app@0.4.0
  - @cloud-carbon-footprint/common@1.3.0

## 1.2.2

### Patch Changes

- a304acb6: Upgrades version of typescript to 4.5.3
- Updated dependencies [a304acb6]
- Updated dependencies [a304acb6]
  - @cloud-carbon-footprint/app@0.3.2
  - @cloud-carbon-footprint/common@1.2.1

## 1.2.1

### Patch Changes

- 4238d3b8: Cache produces different data depending on which page is loaded

  For changes to the create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/70ae49e00e3d0bb3fd5c9e439a6a309bc9f04381)

- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
- Updated dependencies [4238d3b8]
  - @cloud-carbon-footprint/app@0.3.1

## 1.2.0

### Minor Changes

- 52237bc6: Adds additional dashboard for viewing cloud provider recommendations including refactoring filters for reusability

  For updating the create-app templates, please refer to the following [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d1f9a94ea88e6f9210a781e16df18b9f64a0b03d).

### Patch Changes

- f3569daa: Updates emissions factor api response to include cloud provider

  For create-app template updates, please refer to [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/c19cca55d4c095d81f0bb80745580741d73405b5)

- Updated dependencies [f3569daa]
- Updated dependencies [61332214]
- Updated dependencies [52237bc6]
  - @cloud-carbon-footprint/app@0.3.0
  - @cloud-carbon-footprint/common@1.2.0

## 1.1.0

### Minor Changes

- 52a8b3c1: Adds support for specifying recommendation target for AWS via API parameter

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/404c77796ae838766dc8007e18daee2c7526f6ed) to update create app templates.

### Patch Changes

- Updated dependencies [f75cf08f]
- Updated dependencies [52a8b3c1]
  - @cloud-carbon-footprint/app@0.2.0
  - @cloud-carbon-footprint/common@1.1.0

## 1.0.0

### Major Changes

- 91ed3d75: Update variables GCP_BILLING_ACCOUNT_ID/GCP_BILLING_ACCOUNT_NAME to be GCP_BILLING_PROJECT_ID/GCP_BILLING_PROJECT_NAME

  This is a major update for packages: api, cli, common. Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/aab00ea5a395d94ba5ce1424ffa33abbafd7ed58) for create-app template updates as they are breaking changes.

### Minor Changes

- 13f39ac7: implements recommendations for aws rightsizing recommendations api

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/b2181a1942b0910613c8b15f97d074a7be6100b8) to update create app templates.

### Patch Changes

- bbceed8b: Updates dependencies: @types/fs-extra, typescript, husky and @types/node
- Updated dependencies [13f39ac7]
- Updated dependencies [91ed3d75]
- Updated dependencies [72fc2752]
- Updated dependencies [e76d5fdd]
- Updated dependencies [bbceed8b]
  - @cloud-carbon-footprint/app@0.1.0
  - @cloud-carbon-footprint/common@1.0.0

## 0.3.2

### Patch Changes

- 3b42775b: Updates @types/node to 15.12.4
- Updated dependencies [e93d31ec]
- Updated dependencies [3b42775b]
- Updated dependencies [53366130]
  - @cloud-carbon-footprint/common@0.0.3
  - @cloud-carbon-footprint/app@0.0.4

## 0.3.1

### Patch Changes

- Updated dependencies [8e24c32b]
  - @cloud-carbon-footprint/common@0.0.2
  - @cloud-carbon-footprint/app@0.0.3

## 0.3.0

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
- 54c6e5fc: updates check for error type

  `packages/api/src/api.ts`:

  ```diff
      // ...

        } catch (e) {
          apiLogger.error(`Unable to process footprint request.`, e)
  -       if (e instanceof EstimationRequestValidationError) {
  +       if (
  +          e.constructor.name ===
  +          EstimationRequestValidationError.prototype.constructor.name
  +       ) {
            res.status(400).send(e.message)
  -       } else if (e instanceof EstimationRequestValidationError) {
  +       } else if (
  +          e.constructor.name === PartialDataError.prototype.constructor.name
  +       ) {
            res.status(416).send(e.message)
          } else res.status(500).send('Internal Server Error')

      // ...
  ```

  - @cloud-carbon-footprint/app@0.0.2

## 0.2.5

### Patch Changes

- b63d8a67: The default `aws-sdk` dependency was bumped to `"^2.890.0"`,
- f48a0f56: Fix to remove shadowing variables and use socket:

  `packages/api/src/api.ts`:

  ```diff
      // ...

          res: express.Response,
      ): Promise<void> {
      // Set the request time out to 10 minutes to allow the request enough time to complete.
  -   req.connection.setTimeout(1000 * 60 * 10)
  +   req.socket.setTimeout(1000 * 60 * 10)
      const rawRequest: RawRequest = {
          startDate: req.query.start?.toString(),
          endDate: req.query.end?.toString(),

      // ...

      try {
          const emissionsResults: EmissionsRatios[] = Object.values(
          CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
  -     ).reduce((result, cloudProvider) => {
  -       return Object.keys(cloudProvider).reduce((result, key) => {
  -         result.push({ region: key, mtPerKwHour: cloudProvider[key] })
  -         return result
  -       }, result)
  +     ).reduce((cloudProviderResult, cloudProvider) => {
  +       return Object.keys(cloudProvider).reduce((emissionDataResult, key) => {
  +         cloudProviderResult.push({
  +           region: key,
  +           mtPerKwHour: cloudProvider[key],
  +         })
  +         return emissionDataResult
  +       }, cloudProviderResult)
          }, [])
          res.json(emissionsResults)
      } catch (e) {

      // ...
  ```

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

## 0.2.4

### Patch Changes

- 5c35c569: updates create server env file
- 9c61aa15: Fix to remove shadowing variables and use socket
- Updated dependencies [021c345f]
  - @cloud-carbon-footprint/core@0.6.1

## 0.2.3

### Patch Changes

- 81dfde6c: Improves .env.template files with links to cofiguration glossary
- Updated dependencies [8b4c992d]
- Updated dependencies [216ea2ec]
  - @cloud-carbon-footprint/core@0.6.0

## 0.2.2

### Patch Changes

- c0cc067a: adds initial create app package

## 0.2.1

### Patch Changes

- 8175b41d: updates packages with readmes and metadata
- 06ce5868: fixes create server env file to include group query by
- Updated dependencies [8175b41d]
- Updated dependencies [0ccce96b]
  - @cloud-carbon-footprint/core@0.5.0

## 0.2.0

### Minor Changes

- 033a504: adds integration testing

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

## 0.1.2

### Patch Changes

- Updated dependencies [beabadf]
- Updated dependencies [e2ac070]
- Updated dependencies [29e9897]
- Updated dependencies [75176d7]
- Updated dependencies [ce0f249]
- Updated dependencies [29e9897]
- Updated dependencies [a0ac965]
  - @cloud-carbon-footprint/core@0.3.0

## 0.1.1

### Patch Changes

- Updated dependencies [96cb023]
  - @cloud-carbon-footprint/core@0.2.0

## 0.1.0

### Minor Changes

- 3b3bec3: Update packages to have base version
