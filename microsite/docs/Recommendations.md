---
id: get-recommendations
title: Get Recommendations
---

If users would like to view a list of recommendations to lower their energy consumption, co2e emissions as well as potential costs from their cloud usage, we have provided a `/recommendations` route to view the data in JSON format.
Utilizing API's from AWS and GCP, we are able to grab the necessary data to use our [Methodology](https://www.cloudcarbonfootprint.org/docs/methodology) and calculate potential energy savings in kilowatt-hours as well as co2e emissions savings in metric tons.


## AWS
### Rightsizing Recommendations
AWS provides a feature in the Cost Explorer service that helps you identify cost-saving opportunities by downsizing or terminating instances in Amazon EC2.
The Rightsizing API currently only allows us to view usages for recommendation detail from two weeks prior.

For further information regarding the AWS feature, you can view [this documentation](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/ce-rightsizing.html)

The types of recommendations we provide regarding Amazon EC2 instances are:
- Terminate - Remove/shutdown idle instances
- Modify - Downsize instance types (i.e. Modify using instance type t2.micro to t2.nano)

### Permissions

In order to retrieve AWS Right-sizing recommendations, access for Cost Explorer must be enabled. [Here](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/ce-access.html) is documentation for enabling access.

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
