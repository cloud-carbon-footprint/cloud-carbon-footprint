---
id: tagging
title: Tagging
slug: /tagging
sidebar_position: 3
---

Sometimes it may be necessary to organize your data in ways that will allow for better breakdown and visibility across specific organizations, teams, applications, or shared resources. Cloud providers allow for this organization through tagging of resources, both custom tags and CSP assigned tags in key/value pairs. 

CCF supports the capturing of these tags as part of resource metadata and filtering of cached results via an API parameter. Currently tagging support is limited to AWS and those using MongoDB, and filtering data based on tag is only possible when directly querying the API.

By including resource tags in the data retrieved from cloud providers and then filtering to estimate energy and carbon only for specific tags, you can get a better sense of carbon as it relates to your business contexts, org structure, applications, etc. With this information, you can potentially better target areas to focus and optimize.

Tags can be specified by providing a list of tag names to the appropriate config variable within the `.env` file of your API or CLI package.

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

## Tagging Conventions

### AWS

The AWS Cost and Usage Reporting (CUR) translates tag names to names that are valid Athena column names. On top of this, it also adds a prefix to distinguish between user-created tags and AWS-internal tags. While not documented, we have found that a tag such as SourceRepository will be `user:SourceRepository` in CUR, and `resource_tags_user_source_repository` in Athena (AWS-internal tags will be prefixed with `aws:` instead of `user:` in CUR).
To include a list of resource tags for AWS, you must set the `AWS_RESOURCE_TAG_NAMES` with the appropriate prefixes included.

Example:
`AWS_RESOURCE_TAG_NAMES=["user:Environment", "aws:CreatedBy"]`

For more information on AWS tags, you can refer to the [official AWS tagging documentation](https://docs.aws.amazon.com/general/latest/gr/aws_tagging.html).

### GCP

The exported billing data for Google Cloud includes both tags and labels for listed resources. We support both properties as configurable tagging options. This includes organization-level tags, in addition to both project and resource-level labels.
To include a list of resource tags/labels for GCP, you must set the GCP_RESOURCE_TAG_NAMES. Each tag type will need to be specified using the same variable, but using a colon-separated prefix similar to AWS to specify the label/tag type that the key refers to.

Example: `GCP_RESOURCE_TAG_NAMES=["label:example-label", "project:example-projectLabel", "tag:example-tag" ]` will respectively represent the desired label, project label, and tag keys to include.

_Note_: Regardless of the type of tag specified, the resulting key/value pairs for a resource will be aggregated all under the `tags` property for each result. Therefore, the example above, will yield the following results:

```JSON
{
  "cloudProvider": "GCP",
  ...FootprintEstimate,
  "tags": {
        "example-label": "value",
        "example-tag": "value",
        "example-projectLabel": "value"
    }
}
```

With this in mind, it is recommended to use unique keys when including multiple types in order to avoid potential conflicts. If a duplication occurs, the lowest-level type will take precedence (labels > project labels > tags).

#### Permissions

Including tags and labels in query results requires the following roles assigned to a service account:

```text
roles/resourcemanager.tagUser
roles/bigquery.dataOwner
roles/bigquery.user
```

If the service account you're using does not have the correct permissions to view these properties in BigQuery, then you may experience your requests hanging after adding tags to the config variable.

For more information on GCP tags and labels, you can refer to the [official GCP tagging documentation](https://cloud.google.com/resource-manager/docs/tags/tags-creating-and-managing).

### Azure 

The [Azure Consumption API](https://learn.microsoft.com/en-us/rest/api/consumption/) exposes a resource's `tag` property as a field in each row of billing data. This field allows for access to the `resourceGroup` property as well.
Both of these properties can be accessed as tagging configs within CCF. To include a list of resource tags for Azure, you must set the `Azure_Resource_Tag_Names`.

Example: `AZURE_RESOURCE_TAG_NAMES=["resourceGroup", "project", "customer"]`

For more information on Azure tags, you can refer to the [official Azure Consumption tags documentation](https://learn.microsoft.com/en-us/rest/api/consumption/tags/get?source=recommendations&tabs=HTTP).

## Filtering Estimates by Tags via API
Once tags have been included in the data cached in MongoDB, you can filter the data retrieved from the API by specifying the desired tag via API parameter. For more details, please visit the [Filtering Estimates](docs/ConfigurationOptions/DataPersistenceAndCaching.md/#filtering-estimates) section of the [Data Persistence and Caching](docs/ConfigurationOptions/DataPersistenceAndCaching.md) page.  