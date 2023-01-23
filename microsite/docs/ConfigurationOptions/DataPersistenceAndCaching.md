---
id: data-persistence-and-caching
title: Data Persistence and Caching
slug: /data-persistence-and-caching
sidebar_position: 1
---

Calculating estimates can take time and you may wish for a way to persist data to speed up performance of subsequent calls to the API.
We offer the following data caching methods of varying levels of simplicity and power for saving estimates after they are calculated:
- JSON File (default, but will be deprecated)
  - Local filesystem (default, no configuration needed)
  - Google Cloud Storage
- MongoDB (local or cloud database)


### JSON File
#### Local Filesystem
To make local development a pleasant experience with a quick feedback loop, we have a no-setup local caching method that uses a JSON file that is automatically generated. This file will be created in either the packages/api or packages/cli directory – typically with the name of the grouping method included (i.e. `estimates.month.cache.json`. If you would like to see up-to-date estimates, you will have to delete packages/cli/estimates.[grouping].cache.json and/or packages/api/estimates.[grouping].cache.json. Depending on how much usage you have, it could take several minutes to fetch up-to-date estimates and regenerate the cache file.
Note: If you don’t see one of these files, don’t worry. Simply start the server, and load the app for the first time.

Currently, this caching method is planned to be deprecated and will receive decreased support for incoming features made to the app. This is due to its poor scalability which creates issues for those with very large usage data on a typical enterprise or organizational scale. However, it is a great way to get up and start with the app quickly and still appropriate for small-scale users.

#### Google Cloud Storage
As an expansion to the local cache method, you can use the same JSON file generation within a Google Cloud Storage bucket. If you are experiencing long load times in your staging or production environments, or simply wish to forego the local filesystem, the option to store a JSON cache file in the cloud may be the best option for you. This could be especially helpful in improving re-estimate speeds for your deployed environments. In order to use the Google Cloud option, you have to set the following variables in your packages/api or packages/cli/.env file:
```
CACHE_MODE=GCS
GCS_CACHE_BUCKET_NAME=”some-bucket-name”
```
_Note: The Google service account that you are using must have access and permissions to read/write into the bucket._

###### Note on memory limitations:

For JSON Filesystem cache modes, CCF uses read and write streams to get and set estimates. Ultimately, this helps avoid running into JS memory limitations when inevitably needing to stringify the data. The set back for this approach as the data scales is when sending through the REST API result. With express, the JSON response value passed through will need to get stringified. Usually once the data size reaches around 500 mb is when you might see an issue like:

`RangeError: Invalid string length`

For this reason, we have chosen to focus our support on the MongoDB cache mode, where we have implemented pagination for the REST API response which will scale better and avoid the memory limitations. We believe the JSON File cache mode is a good choice for smaller data sets.

### MongoDB Storage

Users or organizations with large amounts of usage data may have difficulty using the default local caching method. For those wishing to persist a larger scale of data, we offer the option of configuring a MongoDB instance to store your estimates. Similar to the local cache system, this method will also speed up subsequent calls to the API and is the recommended and fully supported caching method.

CCF currently supports either a manual local instance via MongoDB Community/Enterprise, or an automated cloud instance via MongoDB Atlas or similar platform.

To use this configuration, first set up a MongoDB instance of your choice:
- Local Instance Manual Setup
- MongoDB Atlas Setup

After setting up a new instance or collection to be used for CCF, configure the following environment variables in your packages/api or packages/cli/.env file:
```
CACHE_MODE=MONGODB
MONGO_URI=mongodb://example-uri
MONGO_CREDENTIALS=/path-to-credentials.pem
```
- The MONGO_URI variable should be set to the connection URI of your MongoDB instance. If using Atlas, you should find this option in the Connect section of your Atlas cluster. For a local instance, the default string is usually “mongodb://localhost:27017” while the service is running.
- The MONGO_CREDENTIALS variable is optionally used when configuring MongoDB Atlas. CCF will need the credentials to be stored and referenced in order to connect.

After calculating estimates for the first time, the app will create a new collection titled “ccf”. Estimates will be separated into timestamps and stored into a collection that is named according to the current grouping method (i.e. “estimates-by-month).

###### Paginating Estimates
Since the MongoDB storage method is capable of storing a large amount of estimates, it is possible the estimates for a requested date range will exceed the ideal size of a REST API response. To accommodate this, we have enabled pagination when fetching estimates using this method alongside the CCF client or querying the API directly.

We have added a configurable limit value used to paginate the data through the client package. `REACT_APP_PAGE_LIMIT` will default to paginating through 1000 documents at a time, but depending on the overall collection size, the limit value can be set to whatever makes the most sense.

When consuming the API directly, you can still take advantage of the paginated feature by configuring it through the use of parameters when querying the /footprint endpoint.
There will need to be additional logic written to loop through multiple requests and paginate the data depending on the specified limit value.

A sample request using limit and skip parameters may look like:
```
/footprint?start=2021-01-01&end=2021-02-01&limit=30&skip=10
```
- Skip: The number of estimates (MongoDB documents) to skip over
- Limit: The maximum number of estimates (MongoDB documents) to include in the request

_Note: This feature only works when the MONGODB cache mode is enabled. The limit and skip parameters will be ignored for other cache modes._

_For consumers that do not anticipate reaching a memory limitation with their collection size, simply configuring the limit value to a number equal to or greater than the total expected number of documents and a skip value of 0 will allow the API to only need one request._

###### Filtering Estimates

With the MongoDB cache mode, CCF is now supporting the capability to filter estimates by the following keys and request parameters:

- **cloudProviders** (AWS | GCP | Azure)
- **accounts** (via account id)
- **services** (i.e. AmazonDynamoDB)
- **regions** (i.e. us-east-1)
- **tags** (via key/value pairs)

A sample request to filter by cloud providers may look like:
```
/footprint?start=2021-01-01&end=2021-02-01&limit=30&skip=10&cloudProviders=AWS
```

Multiple filters can be provided even within the same key, for example:

`&cloudProviders=AWS&cloudProviders=GCP`

_A note on tags:_
As tagging for our supported cloud service providers is typically set up using key value pairs, the parameters must be set up to handle this appropriately. For example, if you have a tag in AWS called `aws:CreatedBy` and the value is the username, the request parameter should look like:

`&tags[aws:CreatedBy]=username`

_Note: Filtering for Mongodb will only work to filter existing cached data in the collection. Providing these parameters for the initial request to the CSP’s will not return filtered data._

_Filtering is only supported via the API and is not yet supported on the client._

### Caching Configurations

#### Ensure real-time estimates

In order to make local development a pleasant experience with a quick feedback loop, we have a cache file that is automatically generated. If you would like to see up-to-date estimates, you will have to delete `packages/cli/estimates.cache.json` and/or `packages/api/estimates.cache.json`. If you are using MongoDB or GCS to store estimates, you will either have to delete the collection or the estimates file in the storage bucket respectively. Depending on how much usage you have, it could take several minutes to fetch up-to-date estimates and regenerate the cache file.

There is also an optional boolean parameter that can be set to ignore setting estimates to a cache:

`ignoreCache=true`

Or when using the client, you can set an optional environment variable:

`DISABLE_CACHE=true`

#### Seeding cache file

We have an option to run the server side API calls as a background job. This can be useful for larger amounts of data to query from the cloud providers and will have no timeout limit when running with the browser. Before running the script, you will need to set the necessary configurations in a `.env` file in the CLI directory.

From the root directory, run:

`yarn seed-cache-file`

You will then be prompted enter a start date, end date and groupBy parameter. Optionally, you can specify a specific cloud provider to seed. This will allow you to append estimations to given dates in your requested time frame that may be missing from a newly configured cloud provider (currently only supported with a MongoDB caching mode).

Once this process is finished running. A new cache file will be created in the CLI directory. In order to use the cache file to run with the front-end client package, you will have to copy the cache file to the API directory before starting the application.

_Note: If you end up seeing an error due to memory limitations, you will either have to adjust to a smaller date range or change the grouping method._