---
id: tagging
title: Tagging
slug: /tagging
sidebar_position: 3
---

## Overview
Sometimes it may be necessary to organize your data in ways that will allow for better breakdown and visibility across specific organizations, teams, or shared resources.
Cloud providers allow for this custom separation of data through the use of tags. These serve as custom key/value pairs that can be assigned to resources in addition to any internally-assigned tags by the cloud provider, and both are available for visibility and use within CCF. 
These tags allow for better comparison and insights of carbon emissions across different internal teams or products.

### Support
Each estimation result currently includes the associated tags listed for that resource included from the initial cloud provider query. Currently, the visibility of these tags are
only supported through results queried directly from the API/CLI, and is not yet supported on the client dashboard.

_**Important Note**: Tagging visibility and features are currently only supported for AWS, but we are hard at work with including them for other cloud providers._

### Filtering Estimates Using Tags
CCF also allows for resource tags to be specified as a parameter for filtering estimates. This feature is currently only available for cached estimates
when using the [MongoDB](docs/ConfigurationOptions/DataPersistenceAndCaching.md#mongodb-storage) cache option. In addition, the desired tags need to have been specified and [included in the cached estimation results](#including-tags-with-estimations)
prior to your request in order to be available as a filtering option. To learn more about how to filter data by tags, take a look at [filtering estimates.](docs/ConfigurationOptions/DataPersistenceAndCaching.md#filtering-estimates)

## Including Tags With Estimations
CCF provides the option to specify a desired list of assigned resource tags in your estimation results. In doing so, this will allow for
the columns for each specified tag to be included in the cloud provider query and its corresponding value to be included in the estimation results for each resource.


To provide the list of tags that you wish to include, you must set the appropriate variable for that cloud provider within your API or CLI `.env` file.
The list of tags must be provided as an array of strings containing the name of each tag's key that you wish to include.

**Example:**
Specifying `AWS_RESOURCE_TAG_NAMES=["user:Environment"],` in your API or CLI `.env` file will include the corresponding tag value for each AWS resource in the results:
```json
{
  "cloudProvider": "AWS",
  "kilowattHours": 9.17,
  "co2e": 2.064,
  "usesAverageCPUConstant": true,
  "serviceName": "AWSLambda",
  "accountId": "1234567890",
  "accountName": "example-account",
  "region": "eu-west-2",
  "cost": 0.0000238,
  "tags": {
    "user:Environment": "production"
  }
}
```

### AWS Tags
The AWS Cost and Usage Reporting (CUR) translates tag names to names that are valid Athena column names.
On top of this, it also adds a prefix to distinguish between user-created tags and AWS-internal tags.
While not documented, we have found the behaviour to be that a tag such as `SourceRepository` will be `user:SourceRepository` in CUR, and `resource_tags_user_source_repository` in Athena (AWS-internal tags will be prefixed with `aws:` instead of `user:` in CUR).

To include a list of resource tags for AWS, you must set the `AWS_RESOURCE_TAG_NAMES`.

Example:
```dotenv
AWS_RESOURCE_TAG_NAMES=["user:Environment", "aws:CreatedBy"]
```
