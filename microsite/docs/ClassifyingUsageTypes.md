---
id: classifying-usage-types
title: Classifying Usage Types
---

In order to estimate the energy and carbon emissions for a given amount of cloud provider usage, we need to first classify a row of usage as either Compute, SSD Storage, HDD Storage, Networking or Memory. It's also possible that the usage row is unknown, which we have a process or reclassify [here](classifying-usage-types#handling-unknown-usage-types), or unsupported, in which case the application ignores these rows. To understand the steps involved in the classification, please see the [methodology page](https://www.cloudcarbonfootprint.org/docs/methodology#1-using-billing-data-for-cloud-usage-holistic). Once the application has classified the usage row, it then uses the assosiated usage amount when estimating energy and carbon emissions.

In order to make these classification decisions, we pulled all the various types of usage rows that Thoughtworks has utilized into a spreadsheet for analysis. We then researched each type of usage using publicly available information from the cloud providers about the underlying services, often looking at documentation regarding payment/costs as this often gives hints as to the usage type. We have published these usage types and the various classifications in [this spreadsheet](https://docs.google.com/spreadsheets/d/1rMt1lb3G23JnwbAODCka1ohrbl-4pELFSqi6xwwW4q4/) with detailed notes and links to sources when available. 

Given that these usage types have been derived from Thoughtworks' usage, there may be usage types missing that aren't currently supported. If this is case for when using the application, please see instructions for adding unsupported usage types in the documentation for your cloud provider: [AWS](aws#unsupported-usage-types), [GCP](gcp#unsupported-usage-types) and [Azure](azure#unsupported-usage-types). We welcome feedback any/all on these classifications.

## Handling Unknown Usage Types

Currently, the application is built to support the energy and carbon emissions estimations for Compute, Storage, Networking and Memory usage types. Per cloud provider, there is a unique list of services and usage types that we intentionally classify as “Unsupported”. Some of these we do not intend to estimate energy usage, (ie. Refunds, or License fees).

There are, however, a number of billing line items that may not meet the criteria to be classified with a high degree of confidence as compute, storage, networking or memory - despite us having confidence there is energy and carbon emissions associated with them. This can be the case with higher level managed services where we have little information about the underlying infrastructure provisioned. For these line items, we have developed an approach that estimates energy and carbon emissions using cost as a proxy. For each of these line items we identify the best fit usage type (compute, storage, networking, memory), and then use the average CO2e per dollar of that type to calculate the carbon from the line item’s cost.

### Applying the Co2e/Cost Coefficient

The Co2e/Cost Coefficient is dynamically determined by calculating the sum of the Co2e and Cost respectively per each classification and then dividing that total CO2e by the total cost. For example, if the sum of all the usage classified as Compute was found to be 10 metric tons of Co2e and $10,000 of Cost, the “compute coefficient” would be 0.001 metric tons/dollars (10 metric tons / $10,000). 

Once we determine the coefficient for each classification, we are able to attempt to “re-classify” the previously determined Unknown usage types. This approach varies from checking the usage unit, to parsing out specific strings from the usage type description of the Unknown usage. For example, if the Unknown usage has a usage unit of “10 Hours” or “seconds”, or the usage type description contains the string “2 vCPU”, we can reasonably assume this could be re-classified as Compute. You can see examples of these re-classified Unknown usage rows for each cloud provider in [this spreadsheet](https://docs.google.com/spreadsheets/d/1vA91srfzCCQUSfDnvSxCLr30a0KzdoiGt1CQ2T8LrDY/edit?usp=sharing).

Once we make this reclassification, we multiply the respective Co2e/Cost Coefficient by the cost of the specific Unknown usage to determine a Co2e estimation. In the current example where we have re-classified the Unknown usage as Compute, we can hypothetically say this usage has a cost of $200. We can then calculate a Co2e estimation by multiplying the $200 cost by the determined Compute coefficient of 0.001 to return 0.02 metric tons. The energy (kilowatt-hours) can then be determined by dividing the estimated CO2e by the regional Emissions Factor for that usage row.

We use the same approach for re-classifying Unknown usages as Compute, Storage, Networking and Memory. If we are still unable to re-classify the usage, it will remain as Unknown and we will multiply the cost of the Unknown usage by a CO2e/Cost coefficient based on the total cost and total co2e of that specific cloud provider usage. These dynamic coefficients will be consumer specific as each user of the application will have different sums of cost and co2e.

We welcome any and all feedback on this approach, or suggestions for entirely different approaches to handling Unknown cloud usage.
