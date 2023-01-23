---
id: tagging
title: Tagging
slug: /tagging
sidebar_position: 3
---

Sometimes it may be necessary to organize your data in ways that will allow for better breakdown and visibility across specific organizations, teams, applications, or shared resources. Cloud providers allow for this organization through tagging of resources, both custom tags and CSP assigned tags in key/value pairs. 

CCF supports the capturing of these tags as part of resource metadata and filtering of cached results via an API parameter. Currently tagging support is limited to AWS and those using MongoDB, and filtering data based on tag is only possible when directly querying the API.

By including resource tags in the data retrieved from cloud providers and then filtering to estimate energy and carbon only for specific tags, you can get a better sense of carbon as it relates to your business contexts, org structure, applications, etc. With this information, you can potentially better target areas to focus and optimize.

Example: Specifying `AWS_RESOURCE_TAG_NAMES=["user:Environment", “aws:createdBy”]` in your API or CLI `.env` file will include the corresponding tag values for each AWS resource in the results:
```JSON
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
   "user:Environment": "production",
   “user:Production”: “IAMUser:example-user”,
 }
}
```

### A Note on AWS Tagging Conventions
The AWS Cost and Usage Reporting (CUR) translates tag names to names that are valid Athena column names. On top of this, it also adds a prefix to distinguish between user-created tags and AWS-internal tags. While not documented, we have found that a tag such as SourceRepository will be user:SourceRepository in CUR, and resource_tags_user_source_repository in Athena (AWS-internal tags will be prefixed with aws: instead of user: in CUR).
To include a list of resource tags for AWS, you must set the AWS_RESOURCE_TAG_NAMES.
Example:
AWS_RESOURCE_TAG_NAMES=["user:Environment", "aws:CreatedBy"]

For more information on AWS tags, you can refer to the [official AWS tagging documentation](https://docs.aws.amazon.com/general/latest/gr/aws_tagging.html).

## Filtering Estimates by Tags via API
Once tags have been included in the data cached in MongoDB, you can filter the data retrieved from the API by specifying the desired tag via API parameter. For more details, please visit the [Filtering Estimates](docs/ConfigurationOptions/DataPersistenceAndCaching.md/#filtering-estimates) section of the [Data Persistence and Caching](docs/ConfigurationOptions/DataPersistenceAndCaching.md) page.  