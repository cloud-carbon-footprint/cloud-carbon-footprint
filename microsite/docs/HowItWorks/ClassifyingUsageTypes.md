---
id: classifying-usage-types
title: Classifying Usage Types
slug: /classifying-usage-types
sidebar_position: 3
---

In order to estimate the energy and carbon emissions for a given amount of cloud provider usage, we need to first classify a row of usage as either Compute, SSD Storage, HDD Storage, Networking or Memory. It's also possible that the usage row is unknown, which we have a process or reclassify [here](#handling-unknown-usage-types), or unsupported, in which case the application ignores these rows. To understand the steps involved in the classification, please see the [methodology page](./Methodology.md#using-billing-data-for-cloud-usage-holistic). Once the application has classified the usage row, it then uses the associated usage amount when estimating energy and carbon emissions.

In order to make these classification decisions, we pulled all the various types of usage rows that Thoughtworks has utilized into a spreadsheet for analysis. We then researched each type of usage using publicly available information from the cloud providers about the underlying services, often looking at documentation regarding payment/costs as this often gives hints as to the usage type. We have published these usage types and the various classifications in [this spreadsheet](https://docs.google.com/spreadsheets/d/1rMt1lb3G23JnwbAODCka1ohrbl-4pELFSqi6xwwW4q4/) with detailed notes and links to sources when available. 

Given that these usage types have been derived from Thoughtworks' usage, there may be usage types missing that aren't currently supported. If this is case for when using the application, please see instructions for adding unsupported usage types in the documentation for your cloud provider: [AWS](../ConnectingData/AWS.md#unsupported-usage-types), [GCP](../ConnectingData/GCP.md#unsupported-usage-types) and [Azure](../ConnectingData/Azure.md#unsupported-usage-types). We welcome feedback any/all on these classifications.

## Handling Unknown Usage Types

Currently, the application is built to support the energy and carbon emissions estimations for Compute, Storage, Networking and Memory usage types. For the purpose of this documentation, these should be considered “known” usage types. Per cloud provider, there is a unique list of services and usage types that we intentionally classify as “Unsupported”. Some of these we do not intend to estimate energy usage, (i.e. Refunds, or License fees).

There are, however, a number of billing line items that may not meet the criteria to be classified with a high degree of confidence as compute, storage, networking or memory - despite us having confidence there is energy and carbon emissions associated with them. This can be the case with higher level managed services where we have little information about the underlying infrastructure provisioned. For these line items, we have developed an approach that estimates energy and carbon emissions using usage amount (GCP, Azure) or cost (AWS) as a proxy. For each of these line items we identify the best fit known usage type by looking at the service and usage unit, then use the average kilowatt-hour per dollar of that best fit usage type to calculate the energy, using the line item’s usage amount or cost depending on the cloud provider.

### Applying the Kilowatt-hour/Cost Coefficient

For each “known” usage type, we dynamically build the average kilowatt-hour per usage amount (or cost for AWS) for each unique service and usage unit combination, then multiply that by the usage amount (or cost for AWS) for any unknown rows. Here are these steps in more detail, using GCP services and usage units as an example:

1. For known usage rows, track usageAmount and kilowattHour per service and usage unit, accumulating the values. The result looks something like this:
```
{
  kubernetesEngine: {
    seconds: {
      usageAmount: 10,
      kilowattHours: 100,
},
    bytes: {
      usageAmount: 20,
      kilowattHours: 200,
}
},
  computeEngine: {...},
  totals: {
    seconds: {
      usageAmount: 50,
      kilowattHours: 1000,
},
  bytes: {...},
}
```
2. For each unknown row, if there is a known usageAmount/kilowattHours ratio with the same service and usage unit, multiply the usageAmount by the ratio to determine the estimated kilowatt hours. Then convert that to CO2e based on Google’s published grid emission and carbon free energy percentage, per data center. For example, if we had this “unknown” row using the example data in the previous bullet, the estimated kilowatt-hours would be 100 / 10 * 300 = 3000 kilowatt-hours:

| Service name     | Usage unit Value | Usage amount |
|------------------|------------------|--------------|
| kubernetesEngine | seconds          | 300          |

#### Why we use cost for AWS instead:

In the case of AWS, we track and accumulate known Kilowatt-hours and cost, rather than the Kilowatt-hours and usage amount. We then multiply the cost of unknown usage by these dynamic coefficients. This is because there is no column for “usage unit” in the AWS Cost and Usage Reports, only a “pricing unit”. This means we are unable to use the usage amount to estimate kilowatt hours as we don’t know what usage unit we should multiply it by to estimate Kilowatt-hours.

We welcome any and all feedback on this approach, or suggestions for entirely different approaches to handling Unknown cloud usage.
