---
id: running-the-api
title: Running the API
slug: /running-the-api
sidebar_position: 5
---

Sometimes, you may want to receive raw estimates or integrate estimate data into your own dashboard or tool. For this purpose, we've made it possible to run and deploy the API on its own. It allows direct queries for estimates with custom parameters, including more granular request options to specify the exact data you're looking for, including special options for [filtering](../ConfigurationOptions/DataPersistenceAndCaching.md#filtering-estimates).

#### Running the API Locally

From the root directory:

`yarn start-api`

From the package directory:

`yarn start`

## Endpoints

The API has several endpoints you can query for emissions data:

- `/footprint` - Gets calculated energy and carbon estimates for a given date range
- `/regions/emissions-factors` - Gets the carbon intensity (CO2e/kWh) of all cloud provider regions
- `/recommendations` - Gets recommendations from cloud providers and their estimated carbon and energy impact

### Documentation

Each API endpoint and its parameters have been documented using the OpenAPI Specification language (3.0), which can be parsed or read in the `packages/api/src/api.ts` file.

For better visibility of this documentation, we have implemented a Swagger UI portal to view and test each endpoint. When running the API locally, this portal is accessible via browser at `localhost:4000/docs`. You can also fetch a JSON version of the documentation by making a GET request to the `/docs.json` endpoint.
