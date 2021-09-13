# @cloud-carbon-footprint/cli

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
