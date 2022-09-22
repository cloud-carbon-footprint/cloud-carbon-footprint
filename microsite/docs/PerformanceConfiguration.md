---
id: performance-considerations
title: Performance Considerations
slug: /performance-considerations
---

### Options to Improve Query Performance

When running very large amounts of data with the default configuration of querying each day for the previous year, we have noticed that the time it takes to start the app increases significantly. We have added optional configuration to help with this performance issue to query and date filter in a few different ways:

#### Date Range

In your `packages/client/.env` file, you can provide the following variables for a custom date range:

- `REACT_APP_DATE_RANGE_TYPE` (example values: day(s), week(s), month(s), etc..)
- `REACT_APP_DATE_RANGE_VALUE` (example values: number correlating to day/week/month etc..)

#### Group By Timestamp in Queries

In your `packages/client/.env` file, you can provide the following variable for a custom query option to group the data by date type:

- `REACT_APP_GROUP_BY` (example values: day, week, month, quarter, year)


Please Note: 
- Data grouped by time periods other than days will usually honor the time period of the grouping over a specific date range that falls within the range. For example, when data is grouped by month and the dates Oct. 18 - Nov. 12 are requested, the API and UI will return one data point for November that includes all available data for the month of November (1st - 30th). Behavior when requesting specific dates including portions of the group by period may not be consistent due to caching.

### Caching Configurations

#### Ensure real-time estimates

In order to make local development a pleasant experience with a quick feedback loop, we have a cache file that is automatically generated. If you would like to see up-to-date estimates, you will have to delete `packages/cli/estimates.cache.json` and/or `packages/api/estimates.cache.json`. Depending on how much usage you have, it could take several minutes to fetch up-to-date estimates and regenerate the cache file.

Note: If you don’t see one of these files, don’t worry. Simply start the server, and load the app for the first time.

#### Storing cache file

Currently, we support storing the cache file with two different options:

- Local filesystem (default, no configuration needed)
- Google Cloud Storage

If you are experiencing long load times in your staging or production environments, the option to store the cache file in the cloud and clear it when you would like to re-estimate may be the best option for you. In order to use the Google Cloud option, you have to set the following variables in your `.env` file:

`CACHE_MODE=GCS`

`GCS_CACHE_BUCKET_NAME=”some-bucket-name”`

Note: The Google service account that you are using must have access and permissions to read/write into the bucket.


#### Seeding cache file

We have an option to run the server side API calls as a background job. This can be useful for larger amounts of data to query from the cloud providers and will have no timeout limit when running with the browser. Before running the script, you will need to set the necessary configurations in a `.env` file in the CLI directory.

From the root directory, run:

`yarn seed-cache-file`

You will then be prompted enter a start date, end date and groupBy parameter. Once this process is finished running. A new cache file will be created in the CLI directory. In order to use the cache file to run with the front-end client package, you will have to copy the cache file to the API directory before starting the application.