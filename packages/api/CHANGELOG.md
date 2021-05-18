# @cloud-carbon-footprint/api

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
