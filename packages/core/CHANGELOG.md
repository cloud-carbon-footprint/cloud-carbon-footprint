# @cloud-carbon-footprint/core

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
