---
id: classifying-usage-types
title: Classifying Usage Types
slug: /classifying-usage-types
---

In order to estimate the energy and carbon emissions for a given amount of cloud provider usage, we need to first classify a row of usage as either Compute, SSD Storage, HDD Storage, Networking or Memory. It's also possible that the usage row is unknown, which we have a process or reclassify [here](./ClassifyingUsageTypes.md#handling-unknown-usage-types), or unsupported, in which case the application ignores these rows. To understand the steps involved in the classification, please see the [methodology page](./Methodology.md#1-using-billing-data-for-cloud-usage-holistic). Once the application has classified the usage row, it then uses the associated usage amount when estimating energy and carbon emissions.

In order to make these classification decisions, we pulled all the various types of usage rows that Thoughtworks has utilized into a spreadsheet for analysis. We then researched each type of usage using publicly available information from the cloud providers about the underlying services, often looking at documentation regarding payment/costs as this often gives hints as to the usage type. We have published these usage types and the various classifications in [this spreadsheet](https://docs.google.com/spreadsheets/d/1rMt1lb3G23JnwbAODCka1ohrbl-4pELFSqi6xwwW4q4/) with detailed notes and links to sources when available. 

Given that these usage types have been derived from Thoughtworks' usage, there may be usage types missing that aren't currently supported. If this is case for when using the application, please see instructions for adding unsupported usage types in the documentation for your cloud provider: [AWS](./AWS.md#unsupported-usage-types), [GCP](./GCP.md#unsupported-usage-types) and [Azure](./Azure.md#unsupported-usage-types). We welcome feedback any/all on these classifications.

## Handling Unknown Usage Types

Currently, the application is built to support the energy and carbon emissions estimations for Compute, Storage, Networking and Memory usage types. Per cloud provider, there is a unique list of services and usage types that we intentionally classify as “Unsupported”. Some of these we do not intend to estimate energy usage, (i.e. Refunds, or License fees).

There are, however, a number of billing line items that may not meet the criteria to be classified with a high degree of confidence as compute, storage, networking or memory - despite us having confidence there is energy and carbon emissions associated with them. This can be the case with higher level managed services where we have little information about the underlying infrastructure provisioned. For these line items, we have developed an approach that estimates energy and carbon emissions using cost as a proxy. For each of these line items we identify the best fit usage type (compute, storage, networking, memory), and then use the average kilowatt-hour per dollar of that type to calculate the energy use from the line item’s cost.

### Applying the Kilowatt-hour/Cost Coefficient

The Kilowatt-hour/Cost Coefficient is dynamically determined by calculating the sum of the Kilowatt-hours and Cost respectively per each classification and then dividing that total Kilowatt-hours by the total cost. For example, if the sum of all the usage classified as Compute was found to be 100 Kilowatt-hours and $1,000 of Cost, the “compute coefficient” would be 0.1 Kilowatt-hours/dollars (100 Kilowatt-hours / $1,000). 

Once we determine the coefficient for each classification, we are able to attempt to “re-classify” the previously determined Unknown usage types. This approach varies from checking the usage unit, to parsing out specific strings from the usage type description of the Unknown usage. For example, if the Unknown usage has a usage unit of “10 Hours” or “seconds”, or the usage type description contains the string “2 vCPU”, we can reasonably assume this could be re-classified as Compute. You can see examples of these re-classified Unknown usage rows for each cloud provider in [this spreadsheet](https://docs.google.com/spreadsheets/d/1vA91srfzCCQUSfDnvSxCLr30a0KzdoiGt1CQ2T8LrDY/edit?usp=sharing).

Once we make this reclassification, we multiply the respective Kilowatt-hour/Cost Coefficient by the cost of the specific Unknown usage to determine a Kilowatt-hour estimation. We then multiply this by the cloud provider grid emissions factors based on the region, to get estimated metric tons of CO2e. 

We use the same approach for re-classifying Unknown usages as Compute, Storage, Networking and Memory. If we are still unable to re-classify the usage, it will remain as Unknown and we multiply the cost of the Unknown usage by a Kilowatt-hour/Cost coefficient based on the total cost and total Kilowatt-hour of that specific cloud provider usage. These dynamic coefficients will be consumer specific as each user of the application will have different sums of cost and Kilowatt-hours.

We welcome any and all feedback on this approach, or suggestions for entirely different approaches to handling Unknown cloud usage.
