---
id: performance-configurations
title: Performance Configurations
---

### Options to Improve Query Performance

When running very large amounts of data with the default configuration of querying each day for the previous year, we have noticed that the time it takes to start the app increases significantly. We have added optional configuration to help with this performance issue to query and date filter in a few different ways:

#### Date Range

In your `packages/client/.env` file, you can provide the following variables for a custom date range:

- `REACT_APP_DATE_RANGE_TYPE` (example values: day(s), week(s), month(s), etc..)
- `REACT_APP_DATE_RANGE_VALUE` (example values: number correlating to day/week/month etc..)

#### Group By Timestamp in Queries

In your `packages/api/.env` file, you can provide the following variable for a custom query option to group the data by date type:

- `GROUP_QUERY_RESULTS_BY` (example values: day, week, month, quarter, year)

### Caching Configurations

#### Ensure real-time estimates

In order to make local development a pleasant experience with a quick feedback loop, we have a cache file that is automatically generated. If you would like to see up to date estimates, you will have to delete `packages/cli/estimates.cache.json` and/or `packages/api/estimates.cache.json`. Depending on how much usage you have, it could take several minutes to fetch up to date estimates and regenerate the cache file.

Note: If you don’t see one of these files, don’t worry. Simply start the server, and load the app for the first time.

#### Storing cache file

Currently, we support storing the cache file with two different options:

- Local filesystem (default, no configuration needed)
- Google Cloud Storage

If you are experiencing long load times in your staging or production environments, the option to store the cache file in the cloud and clear it when you would like to re-estimate may be the best option for you. In order to use the Google Cloud option, you have to set the following variables in your `.env` file:

`CACHE_MODE=GCS`

`GCS_CACHE_BUCKET_NAME=”some-bucket-name”`

Note: The Google service account that you are using must have access and permissions to read/write into the bucket.
