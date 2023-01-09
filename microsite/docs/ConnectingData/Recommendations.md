---
id: recommendations
title: Recommendations
slug: /recommendations
sidebar_position: 5
---

If users would like to view a list of recommendations to lower their energy consumption, co2e emissions as well as potential costs from their cloud usage, we have provided a `/recommendations` route to view the data in JSON format.
Utilizing API's from AWS and GCP, we are able to grab the necessary data to use our [Methodology](docs/HowItWorks/Methodology.md) and calculate potential energy savings in kilowatt-hours as well as co2e emissions savings in metric tons.


## AWS
### Rightsizing Recommendations
AWS provides a feature in the Cost Explorer service that helps you identify cost-saving opportunities by downsizing or terminating instances in Amazon EC2.
The Rightsizing API currently only allows us to view usages for recommendation detail from two weeks prior.

For further information regarding the AWS feature, you can view [this documentation](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/ce-rightsizing.html)

The types of recommendations we provide regarding Amazon EC2 instances are:
- Terminate - Remove/shutdown idle instances
- Modify - Downsize instance types (i.e. Modify using instance type t2.micro to t2.nano)

#### Permissions

In order to retrieve AWS Right-sizing recommendations, access for Cost Explorer must be enabled. [Here](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/ce-access.html) is documentation for enabling access.

### Compute Optimizer Recommendations

In addition to Rightsizing recommendations, AWS has a service called [Compute Optimizer](https://aws.amazon.com/compute-optimizer/) that provides recommendations for reducing the cost of EC2 instances, Autoscaling Groups, EBS Volumes and Lambda functions.

There is some overlap with the Rightsizing recommendations above when it comes to EC2. By default, when our application finds a recommendation for the same EC2 instance type, our recommendations API returns the recommendation that has the highest amount of carbon savings, which could be from either the Rightsizing or Compute Optimizer recommendations.

To include Compute Optimizer recommendations across all your AWS accounts and regions, there is some serverless infrastructure that is required to be deployed. This is because the Compute Optimizer API requires you to make individual requests for recommendations in each region and account, which isn’t performant enough with larger AWS organizations. There may be a small cost associated with running this infrastructure.

Here is a diagram of the infrastructure that needs to be deployed:

![CCF Compute Optimizer Architecture](../../static/img/ccf_compute_optimizer.svg)

To summarize: this infrastructure triggers an export of all Compute Optimizer recommendations for each region you are using into region-specific buckets using a CloudWatch Event and Lambda function. Then, using an S3 Event on those buckets, another Lambda function is triggered to copy the recommendations into a central bucket that the Cloud Carbon Footprint (CCF) application will read from.

To make this easier, we have a [Cloud Formation template](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/cloudformation/ccf-compute-optimizer.yaml) that configures this infrastructure for you. It requires these parameters:

- **BucketNamePrefix** - a prefix used for the region-specific buckets, in order for them to be globally unique, which is required by S3 bucket names.  
- **CentralBucketName** - name of the central bucket that CCF will read from
- **CCFRoleName** - name of the AWS role that the CCF application is running as. This is "ccf-app” if you used our default CloudFormation template to set up permissions for AWS.
- **CreateCentralBucket** - a true or false value that determines whether to create the central bucket when you execute the template. Defaults to true.
- **IncludeMemberAccounts** - a true or false value that specifies whether to export Compute Optimizer recommendations for all accounts in a region. Defaults to true.

This template needs to be executed as an [AWS StackSet](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html) in the top level or administrator account, and will allow you to select the regions in which you want the above infrastructure to be created. You're welcome to modify the template to include any necessary or preferred security policies for your organization.

#### Additional environment variables required by CCF

In order for your CCF application to read recommendations from the central bucket, there are some additional configuration options that are required. You can read about them in the [Configuration Glossary](./configurations-glossary#optionally-set-these-aws-variables).

## GCP
### Recommender
GCP has many featured Recommenders. Our app is able to utilize Compute Engine resource rightsizing to provide recommendations to reduce energy usage and co2e emissions.

For further information regarding the GCP feature, you can view [this documentation](https://cloud.google.com/recommender)

The types of recommendations we provide to reduce compute and storage consumption are:
- Stop VM - Identify and delete idle virtual machines
- Change Machine Type - Resize virtual machines for optimization
- Snapshot and Delete Disk - Identify and delete unnecessary snapshots and persistent disks 
- Delete Image - Deleted unused images.

### Permissions

Required permissions necessary for the GCP Recommender Client:
<details>
  <summary>
    Click to expand...
  </summary>

| Permissions |
| ------ |
| cloudasset.assets.listResource |
| compute.addresses.get |
| compute.addresses.list |
| compute.disks.get |
| compute.disks.list |
| compute.images.get |
| compute.images.list |
| compute.instances.get |
| compute.instances.list |
| compute.machineTypes.get |
| recommender.cloudsqlInstanceOutOfDiskRecommendations.get |
| recommender.cloudsqlInstanceOutOfDiskRecommendations.list |
| recommender.commitmentUtilizationInsights.get |
| recommender.commitmentUtilizationInsights.list |
| recommender.computeAddressIdleResourceInsights.get |
| recommender.computeAddressIdleResourceInsights.list |
| recommender.computeAddressIdleResourceRecommendations.get |
| recommender.computeAddressIdleResourceRecommendations.list |
| recommender.computeDiskIdleResourceInsights.get |
| recommender.computeDiskIdleResourceInsights.list |
| recommender.computeDiskIdleResourceRecommendations.get |
| recommender.computeDiskIdleResourceRecommendations.list |
| recommender.computeImageIdleResourceInsights.get |
| recommender.computeImageIdleResourceInsights.list |
| recommender.computeImageIdleResourceRecommendations.list |
| recommender.computeInstanceGroupManagerMachineTypeRecommendations.get |
| recommender.computeInstanceGroupManagerMachineTypeRecommendations.list |
| recommender.computeInstanceIdleResourceRecommendations.list |
| recommender.computeInstanceMachineTypeRecommendations.list |
| recommender.locations.list |
| recommender.loggingProductSuggestionContainerInsights.list |
| recommender.loggingProductSuggestionContainerRecommendations.list |
| recommender.monitoringProductSuggestionComputeInsights.list |
| recommender.monitoringProductSuggestionComputeRecommendations.list |
| recommender.usageCommitmentRecommendations.get |
| recommender.usageCommitmentRecommendations.list |
| resourcemanager.projects.get |
| resourcemanager.projects.list |
</details>

## Query Parameter Options
In the case of AWS Right-sizing recommendations, we have provided an optional query parameter `awsRecommendationTarget` to customize modify type recommendations that are returned.

The default value of the parameter is set to `SAME_INSTANCE_FAMILY`. Currently, another option would be to return recommendations to modify instances across different instance types. This query parameter would look like the following:

```
/recommendations?awsRecommendationTarget=CROSS_INSTANCE_FAMILY
```

Providing this query parameter will only affect AWS recommendations and not GCP.
