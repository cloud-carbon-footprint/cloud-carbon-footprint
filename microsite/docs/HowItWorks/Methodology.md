---
id: methodology
title: Methodology
slug: /methodology
sidebar_position: 1
toc_max_heading_level: 4
---

## Summary

Global greenhouse gas emissions from the tech sector are on par or larger than the aviation industry, at around
[3% for ICT](https://c2e2.unepdtu.org/wp-content/uploads/sites/3/2020/03/greenhouse-gas-emissions-in-the-ict-sector.pdf)
and [2% for aviation](https://www.atag.org/facts-figures.html) respectively. Within ICT, data centers are responsible for around 1%
of greenhouse gas emissions and
[global electricity usage](https://www.iea.org/reports/data-centres-and-data-transmission-networks).
Currently, most cloud providers do not disclose energy or carbon emissions from cloud usage to their customers
(at an aggregate or individual level), which can be a challenge for organizations who want to baseline and reduce
their carbon footprint. This application is a starting point to enable organizations to have greater visibility into
their emissions across multiple cloud providers.

There are currently no guidelines for reporting Scope 3 emissions as part of the Greenhouse Gas (GHG) Protocol, which
cloud provider usage would fall under. However, we hope more and more organizations report on both location-based and
market-based emissions from cloud usage. To that end, this application’s focus is on providing a location-based cloud
emissions estimate, and we welcome contributions that could aid with market-based reporting to include energy attributes
such as RECs or power purchasing agreements.

This application pulls usage data (compute, storage, networking, etc.) from major cloud providers and calculates
estimated energy (Watt-Hours) and greenhouse gas emissions expressed as carbon dioxide equivalents (metric tons CO2e). We
display these visualizations in a dashboard for developers, sustainability leaders and other stakeholders in an
organization to view and take action. It currently supports AWS, Google Cloud and Microsoft Azure.

**We calculate our CO2e estimates with this formula:**<br />*Total CO2e = operational emissions + embodied Emissions*

Where:

*Operational emissions* = `(Cloud provider service usage) x (Cloud energy conversion factors [kWh]) x (Cloud provider Power Usage Effectiveness (PUE)) x (grid emissions factors [metric tons CO2e])`

And:

*Embodied Emissions* = `estimated metric tons CO2e emissions from the manufacturing of datacenter servers, for compute usage`

Our approach builds upon [Etsy's Cloud Jewels](https://codeascraft.com/2020/04/23/cloud-jewels-estimating-kwh-in-the-cloud/) 
(cloud energy conversion factors) for estimating CO2e emissions for cloud compute and storage services, with 
the addition of networking and memory usage. We similarly use point estimates without confidence intervals due
to the experimental nature of the project, which are not meant as a replacement for data from cloud providers, and we
cannot guarantee their accuracy.

We encourage and welcome any improvements and extensions to both the methodology and
software.We aim to keep this approach up to date, including using the most recent
publicly available data.

## Longer Version

### A note on our approach

Our application is designed to be a starting point which can be extended and customized for individual organizations'
needs. Every organization will have a different cloud setup and tech stack, so we are using domain driven design to
separate the estimation logic from both the data input source (e.g. cloud APIs, on-premise or co-located data centers)
and the output source (e.g front-end dashboard, CSV, etc) so new inputs and outputs can easily be added.

### Cloud usage and cost data source

#### Using Billing Data for Cloud Usage (Holistic)

By default, we query cloud provider billing and usage APIs to provide a holistic understanding of your emissions:

- AWS Cost and Usage Reports with Amazon Athena
- GCP Billing Export Table using BigQuery.
- Azure Consumption Management API

Please see the [Alternative Data Approaches](docs/ConnectingData/AlternativeDataApproaches.md) page for additional information and other data sourcing options.

This pulls usage and cost data from all linked accounts in your AWS, GCP, or Azure Organization. This approach provides us with a more holistic estimation of your cloud energy and carbon consumption, but may be less accurate as we use an average constant (rather than measured) CPU Utilization.

Before estimating the energy and carbon emission, we validate whether a given usage is Compute, Storage, Networking, Memory or Unknown. You can see our classifications of these usage types in following files:

- AWS: packages/aws/src/lib/CostAndUsageTypes.ts
- GCP: packages/gcp/src/lib/BillingExportTypes.ts
- Azure: packages/azure/src/lib/ConsumptionTypes.ts

The process by which we classified the usage types is:

1. Consider the pricing (AWS) or usage (GCP, Azure) unit: if it is hours or seconds, it is likely to be a Compute usage type. If it is byte-seconds or GigaByte-Months, it is likely to be Storage, and if it is bytes of Gigabytes it is likely to be networking. Most other units are ignored.
2. We then further validate whether a line item is Compute, Storage, Networking or Memory by looking at the more detailed usage type.

You can see more details about this logic in following files:

- AWS: packages/aws/src/lib/CostAndUsageReports.ts
- GCP: packages/gcp/src/lib/BillingExportTable.ts
- Azure: packages/azure/src/lib/ConsumptionManagement.ts

We welcome additions, improvements or suggested changes to these classifications or the process.

The way we determine total vCPU Hours for the compute estimation varies for each cloud provider. For AWS and Azure we multiply the usage amount by the product vCPUs, because our understanding is that the usage amount doesn’t include the vCPU count for a given usage row. For GCP, our understanding is that the vCPU count is included in the usage amount for a given row, so we simply use the usage amount by itself.

For AWS Savings Plans, we only include the line item type `SavingsPlanCoveredUsage` because our understanding is that the other Savings Plans line item types refer to fees or discounts in the form of refunds.

When calculating total kilowatt-hours for AWS Lambda service using Billing Data (Holistic), we are assuming that `MemorySetInMB` will be 1792, and since we will then divide this by the constant 1792, we just don't include it in the calculation.

For details on some specific usage type classifications, please view the [Classifying Usage Types page](./ClassifyingUsageTypes.md).

### Energy Estimate (Watt-Hours)

In order to estimate energy used by cloud providers we are leveraging the methodology that Etsy created called 
“[Cloud Jewels](https://codeascraft.com/2020/04/23/cloud-jewels-estimating-kwh-in-the-cloud/)” to determine 
energy coefficients (kWh) for cloud service compute and storage usage. In addition, we’ve added energy estimation 
for networking and memory usage. You can see a summary of all our energy coefficients in Appendix I below.

We look at the servers used by cloud providers on their website and reference their energy usage from both the
[SPECPower](https://www.spec.org/power_ssj2008/results/power_ssj2008.html) database and the [2016 US Data Center Energy
Usage Report](https://eta.lbl.gov/publications/united-states-data-center-energy). Etsy looked into GCP servers and we
have additionally looked into AWS and Azure servers; see list of processors below in Appendix II. Of course this does not account
for any custom processors (such as AWS has) however this is the best information we found publicly available.

#### Compute

For Compute estimation, we follow the same formula as Cloud Jewels, which can be broken down into 2 steps. (We recommend
reading their article for a deeper explanation).

First, we calculate Average Watts which is the average compute energy at a moment in time. When a server is idle,
it still takes some power to run it (Minimum Watts). As the server utilization increases the amount of power
consumed increases too. The total energy used is the min watts plus the watts from additional server usage (average per
hour).

`Average Watts = Min Watts + Avg vCPU Utilization * (Max Watts - Min Watts)`

Second, we then translate this into total Watt Hours based on the amount of time servers are being used, or
virtual CPU hours.

`Compute Watt-Hours = Average Watts * vCPU Hours`

Here are the input data sources for the variables in the formula, and context on where we have sourced them:

- **Min Watts** (constant) - This is dependent on the CPU processor used by the Cloud provider to host the virtual machines.
  Based on publicly available information about which CPUs cloud providers use, we looked up the
  [SPECPower](https://www.spec.org/power_ssj2008/results/power_ssj2008.html) database to determine this constant per processor micro-architecture.
- **Max Watts** (constant) - Same as Min Watts, above.
- **Avg vCPU Utilization** (variable or constant) - This is either pulled from the cloud provider APIs (see above) or falls back to 50% (see below).
- **vCPU Hours** (variable) - This is pulled from the cloud usage APIs or billing data .

When the actual Avg vCPU Utilization for a given time period isn’t available from a cloud provider's API, we fall back
to a projected estimate for the average server utilization of servers in hyperscale data centers in 2020 of 50%, from
the [2016 U.S. Data Center Energy Usage Report](https://eta.lbl.gov/publications/united-states-data-center-energy). For
example, this may occur for AWS EC2 instances that are terminated over 2 weeks ago from when the application first
queries an AWS Account.

When we know what underlying processor micro-architecture or group of micro-architectures are used for a given cloud provider virtual machine, we use the min and max watts for that micro-architecture or the average of a group of micro-architectures. When a group of micro-architectures includes either Ivy Bridge or Sandy Bridge, we use the median of that group. This is because we treat those micro-architectures as outliers due to their comparatively high min/max watts in order to not overestimate. See Appendix II for this list of processors and micro-architectures with the min and max watts.

When we don’t know the underlying processor micro-architecture, we use the average or median of all micro-architectures used by that cloud provider. Here are those averages per cloud provider:

**AWS:**

- Average Min Watts: 0.74
- Average Max Watts: 3.5

**GCP:**

- Median Min Watts: 0.71
- Median Max Watts: 4.26

**Azure:**

- Average Min Watts: 0.78
- Average Max Watts: 3.76

#### Graphic Processing Units (GPUs)

All the major cloud providers have instances or machines that include GPUs. Unfortunately, the SPECPower Database 
doesn’t include energy data for the min and max watts of GPUs, so we have determined a different approach.

When it comes to GPUs, we are able to leverage the same compute estimation formula, but because the cloud providers 
provision entire physical GPUs to customers, instead of using virtual CPU Hours, we use GPU Hours.

When it comes to determining the min and max watts for physical GPUs, we have leveraged a [data set published by Teads](https://medium.com/teads-engineering/building-an-aws-ec2-carbon-emissions-dataset-3f0fd76c98ac) 
that includes the watts at 0% utilization and 100% utilization for various GPU machine types, which is based on data 
provided by [Tech Power Up](https://www.techpowerup.com/gpu-specs/). Teads measured the CPU Utilization at 0% and 100% 
utilization of AWS bare metal instances (CPUs), and applied the same ratio to GPU. We have further applied the same 
ratios for Azure and GCP GPUs, which includes additional GPUs than what Teads published. You can see the full list of 
GPUs and min/max watts in Appendix III below.

We understand there are a number of assumptions underpinning this approach, and very much welcome improvements based on 
ore accurate data sets.


##### A note on AWS Lambda Compute Estimates

In the case of AWS Lambda, AWS does not provide metrics for CPU Utilization and number of vCPU hours, so we need
to take an alternative approach.

Lambdas can consume between 128MB and 10,240MB in 1MB increments
[\[source\]](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html). At 1,792MB a lambda has an
equivalent of one vCPU [\[source\]](https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html). Above
this another vCPU is assigned up to a total of 6 vCPUs, and we can estimate the number of vCPUs allocated to a lambda function as a ratio of the
allocated memory over 1,792MB.

Given this, the formula we derive is:

`Total Watt-Hours = Average Watts X Running Time (Hours) X Estimated number of vCPUs`

where:

`Average Watts = Min Watts + 50% (Average for hyperscale data centers) * (Max Watts - Min Watts)`

`Running Time = Lambda execution time / 3600 seconds`

`Estimated number of vCPUs = Lambda memory allocated (MB) / 1,792 MB`

The execution time and memory allocated are both pulled from the Cost and Usage Reports or CloudWatch Lambda Logs.

##### A note on AWS Aurora Serverless Compute Estimates

In the case of AWS Aurora Serverless using the Cost and Usage Reports, the pricing unit is `ACU-Hrs`. 1 ACU has
approximately 2 GB of memory with corresponding CPU and networking, similar to what is used in Aurora user-provisioned
instances [\[source\]](https://aws.amazon.com/rds/aurora/pricing/). Looking at the most recent Aurora instance classes,
the number of vCPUs provisioned is directly proportional to the amount of memory - roughly one eighth
[\[source\]](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.DBInstanceClass.html).

Given that, for every ACU Hour, we estimate that 0.25 vCPUs are provisioned (2 GB of memory divided by 8). So for
Compute estimations, the application treats every 4 ACU-Hours as one vCPU Hour.

##### A note on GCP Kubernetes Engine (GKE) Compute Estimates 

In the case of GKE clusters, our application makes some assumptions about the number of virtual CPUs provisioned per cluster.
For each cluster you need to provision a number of "nodes", each representing one Compute Engine machine type, with 
the [default machine type being e2-medium](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture), which has one vCPU provisioned. In order to estimate the energy from GKE Compute, we 
multiply the average number of vCPUs provisioned per cluster by the usage amount in hours, to get the total vCPU Hours.

By default, our application assumes 3 vCPUs provisioned because the default number of nodes is 3, and the default machine 
type of e2-medium has 1 vCPU. However, you can override this default using the `GCP_VCPUS_PER_GKE_CLUSTER` [configuration 
option](docs/ConfigurationOptions/ConfigurationsGlossary.md#optionally-set-these-gcp-variables), which we recommend if you know you're provisioning more or less than 3 vCPUs per cluster.     

##### A note on GCP Cloud Composer Compute Estimates

In the case of [Cloud Composer Environments](https://cloud.google.com/composer/docs/concepts/architecture), there are a 
number of vCPUs provisioned based on the environment size, with GKE providing a lot of the underlying infrastructure. 
There are three Cloud Composer Environment sizes, each with a default number of vCPUs that can be provisioned via schedulers,
workers and a web server. In order to estimate the energy from Cloud Composer, we multiply the average number of vCPUs 
provisioned per environment by the usage amount in hours, to get the total vCPU Hours.

By default, our application assumes 14 vCPUs provisioned because this is the default option for the medium environment size.
However, you can override this default using the `GCP_VCPUS_PER_CLOUD_COMPOSER_ENVIRONMENT` [configuration
option](docs/ConfigurationOptions/ConfigurationsGlossary.md#optionally-set-these-gcp-variables), which we recommend if you know you're provisioning more or less than 14 vCPUs per 
environment.

#### Storage

For storage, we also follow the same methodology as Cloud Jewels by deriving a Wh/Tbh coefficient for both HDD and SSD
storage types. However we updated the coefficients to be more accurate for the year 2020, based projections from the
same 2016 U.S Data Center Usage Report.

Here is the estimated HDD energy usage:

- HDD average capacity in 2020 = **10** Terabytes per disk
- Average wattage per disk for 2020 = **6.5** Watts per disk

`Watts per Terabyte = Watts per disk / Terabytes per disk: 6.5 W / 10 TB = 0.65 Watt-Hours per Terabyte-Hour for HDD`

Here is the estimated SSD energy usage:

- SSD average capacity in 2020 = **5** Terabytes per disk
- Average wattage per disk for 2020 = **6** Watts per disk

`Watts per terabyte = Watts per disk / Terabytes per disk: 6 W / 5 TB = 1.2 Watt-Hours per Terabyte-Hour for SSD`

When it comes to measuring the Terabytes from cloud providers, we query for the allocated bytes rather than the utilized
bytes, because this is a more accurate reflection of the energy needed to support that usage. For example, an
organization may have a 20 Gigabyte AWS EBS Volume allocated, but is only utilizing 2 Gigabytes for this block storage
device. In this case we would use 20 GBs in the energy estimation formula for EBS storage.


##### Replication Factors

In order to achieve adequate durability and availability for data stores and to ensure better redundancy in the case 
of service outages, most cloud provider storage, database services and node pools automatically replicate your data as well as any 
associated compute and memory resources. Sometimes this is within an individual data center, other times it is within a 
geographical location or across multiple geographical locations.

Because of this, the actual infrastructure (and energy) required to provide a given amount of storage can be multiple 
times more than what might be provided by cloud providers as the allocated amount of usage. After analyzing cloud 
storage, database services and node pools, we have determined a number of “replication factors” to take this into account, which 
you can see the details of in this [spreadsheet](https://docs.google.com/spreadsheets/d/1D7mIGKkdO1djPoMVmlXRmzA7_4tTiGZLYdVbfe85xQM/edit#gid=735227650). 
These replication factors are applied to the total energy and CO2e estimate for each storage or database service 
(inclusive of all types of resources replicated).

#### Networking

##### Scope

Currently, our application takes into account only the data exchanged between different geographical data centers.

For networking, it is safe to assume that the electricity used to power the internal network is close to 0, or at least negligible compared to the electricity required to power servers. We also have chosen to ignore traffic that leaves a data center to provide end-users with services, because this traffic is usually handled by CDN providers (Content delivery network) which are not necessarily the same provider as for cloud computing. This traffic is also dependent on the behavior of end-users. That said, we would welcome contributions to be able to include this in our approach.

##### Studies to date

There have not been many studies that deal specifically with estimating the electricity impact of exchanging data across data-centers. Most studies focus on estimating the impact of end-user traffic from the data center to the mobile phone; integrating the scope of the core network (what we are interested in), the local access to internet (optical fiber, copper, or 3G/4G/5G) and eventually the connection to the phone (WiFi or 4G).

On top of that, these studies use different methodologies and end up with results with orders of magnitude in differences. See appendix IV below for a summary of the most recent studies. Note that it is very hard to find recent studies that provide an estimation for optical fiber networks, the scope we are interested in.

##### Chosen coefficient

It is safe to assume hyper-scale cloud providers have a very energy efficient network between their data centers with their own optical fiber networks and submarine cable [[source](https://aws.amazon.com/about-aws/global-infrastructure/)]. Data exchanges between data-centers are also done with a very high bitrate (~100 GbE -> 100 Gbps), thus being the most efficient use-case. Given these assumptions, we have decided to use the smallest coefficient available to date: **0.001 kWh/Gb**. Again, we welcome feedback or contributions to improve this coefficient.

We want to thank [@martin-laurent](https://github.com/martin-laurent) for providing this research and recommended coefficient.

#### Memory

##### Chosen Coefficient

For the purpose of estimating energy consumption for memory, we are assuming hyper-scale cloud providers are utilizing
the more efficient memory systems on the market: DDR4 or potentially DDR5. Two memory manufacturers have provided some information
about the energy profile of DDR4 memory systems. [Crucial](https://www.crucial.com/support/articles-faq-memory/how-much-power-does-memory-use) 
says that “As a rule of thumb, however, you want to allocate around 3 watts of power for every 8GB of DDR3 or DDR4 
memory,” which amounts to ~0.375 W/GB. [Micron](https://www.micron.com/-/media/client/global/documents/products/technical-note/dram/tn4007_ddr4_power_calculation.pdf) 
provides a power model that states “... each DRAM will consume approximately 408.3mW of total power,” which equals a 
power consumption of ~0.4083 W/GB. Given this information, we have decided to take the average of both these figures, 
and go with 0.392 W/GB, or 0.000392 kW/GB. In the application we have implemented this as **0.000392 Kilowatt Hour / Gigabyte Hour**.
We want to acknowledge that this is a complex subject with limited available data, and welcome additional research or studies to improve this coefficient.

##### Applying the coefficient

When we utilize the SPECPower Database for estimating compute (above), this also includes some level of energy estimation 
for memory, because the rows in that database represent the min and max watts for entire servers, which includes memory 
usage. Because of this, we only want to apply an additional estimation for memory when the instance you have selected 
from a given cloud provider has a higher amount of memory allocated per physical CPU than what is provided in the SPECPower database.

The way in which we apply this coefficient is slightly different per cloud provider:

##### AWS

Our approach to estimating memory for AWS is as follows:

1. For each microarchitecture in the SPEC Power Database we have determined the average memory (GB) / physical CPU (Chips)
1. For each AWS instance family, we have determined how many physical CPUs we believe are provisioned for the instance type that is roughly equivalent to an entire server, like the rows in the SPEC Power Database. This is often the largest instance in a family, e.g. a “metal” instance.
1. For each AWS instance family, we calculate the difference between the GB / physical CPU from the associated microarchitectures in the SPECPower Database, and the GB / physical CPUs for the comparable instance size, referred to in step 2.
1. If this difference (in GB) is greater than zero, we know an additional memory estimation should be added for this usage row. The amount of kilo-watt hours added for memory is directly proportional to the size of the instance - this is because memory allocated scales linearly within a family. We multiply this proportional amount of additional memory by the chosen coefficient to get kilo-watts hours.
1. If the GB / physical CPU difference is less than or equal to zero, we ignore the usage. We also ignore the usage for any burstable instances, because there is no instance size comparable (large enough) to the SPECPower Database rows.   
1. You can see a full list of these instance types and calculations for memory [here](https://github.com/cloud-carbon-footprint/cloud-carbon-coefficients/blob/main/data/aws-instances.csv).

Here is that formula summarized:

`Kilowatt hours = Memory (GB) exceeding SPECPower database average x Memory coefficient x usage amount (Hours)`

##### GCP

Because Google Cloud provides memory specific usage rows in the Billing Export data, the approach is a lot simpler. 
We take the usage amount in byte-seconds, convert this to gigabyte-hours, then multiply it by the chosen memory 
coefficient to get the kilowatt hours.

Here is that formula summarized:

`Kilowatt hours = Memory usage (GB-Hours) x Memory coefficient`

This approach may be slightly overestimating the total energy and carbon emissions for GCP, because of the 
note above about the min/max watts coefficients from the SPECPower database including some level of memory usage 
for compute estimates. We think this approach is still more accurate than not taking into account the memory usage 
rows at all, and are researching a better way to factor this in for compute estimates. 
We welcome any and all feedback/suggestions on how to improve this.  

##### Azure

Our approach to estimating memory for Azure is very similar to AWS. When it comes to compute instances, it is exactly 
the same approach, and [here](https://github.com/cloud-carbon-footprint/cloud-carbon-coefficients/blob/main/data/azure-instances.csv) 
is a spreadsheet with the full list of instance types and calculations for memory.

In addition to compute instance usage rows, we have found that Azure also has some usage rows that correspond directly 
to memory usage, e.g. “Memory Duration”.  In those cases, we apply the same simplified formula as GCP (above).

We want to thank [@benjamindavyteads](https://github.com/benjamindavyteads) for collaborating with us on this approach, 
and providing much of the research behind it, including the count of physical CPUs for AWS instances that are roughly 
equivalent to the SPEC Power database rows.

### Power Usage Effectiveness

After estimating the kilowatt hours for compute, storage and networking, we need to multiply this by the cloud provider Power Usage Effectiveness (PUE). PUE is a score of how energy efficient a data center is, with the lowest possible score of 1 meaning all energy consumed goes directly to powering the servers and none is being wasted on cooling. This is based on publicly available information provided by the cloud providers. In the case of GCP, they [publish their PUE](https://www.google.com/about/datacenters/efficiency/). In the case of AWS, we have made a conservative guess [based on public information](https://aws.amazon.com/blogs/aws/cloud-computing-server-utilization-the-environment/). Microsoft's Sustainability team have provided a statement<sup>1</sup> as to the PUE for the Azure datacenters.

Here are the cloud provider PUEs being used:

- **AWS:** 1.135
- **GCP:** 1.1
- **Azure:** 1.185

[1] "Organizations are increasingly using the power usage effectiveness (PUE) metric to evaluate the energy efficiency of potential cloud service providers. PUE is essentially the energy going into the datacenter divided by the energy used by the servers. Differing methodologies across the industry for obtaining this metric makes precise comparison across providers difficult. Nevertheless, we have achieved significant improvements as we have continued to evolve both our designs and our operations to achieve among the best efficiency in the industry. Currently, our weighted owned and operated fleet-wide PUE trailing 12-month average is 1.185, and our latest designs are achieving an annual PUE of 1.125."

### Carbon Estimates (CO2e)

Once we have the estimated kilowatt hours for usage of a given cloud provider, we then convert that into estimated CO2e
using publicly available data on emission factors for a given electricity grid based on the mix of local energy sources.
We do this based on the cloud provider datacenter region that each service is running in.

**GCP:**

Google has [published](https://cloud.google.com/sustainability/region-carbon) the grid carbon intensity for their GCP regions, so in this case we use their published factors.

**AWS & Azure:**

In the United States, we use the EPA’s [eGRID2020 Data](https://www.epa.gov/egrid/download-data) that
provides NERC region specific emission factors annual for CO2e. We decided to use the NERC region emission factors rather
than the more granular eGRID subregion or state emissions factors because we feel that it better represents the energy
consumed by data centers, rather than the energy produced in a given state/subregion which those metrics would more
adequately reflect. Outside the US, we generally use carbonfootprint.com’s [country specific grid emissions factors report](https://www.carbonfootprint.com/).
For most of Europe, however, we use [EEA emissions factors](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-9/#tab-chart_2).

You can see the full list of emissions factors in Appendix V below.

We understand this is a rough estimated conversion as these are only averages over a given year that is pre-2020, and
they also don’t take into account time of day. We welcome improvements to this, for example [electrictyMap
API](https://api.electricitymap.org/) provides hourly historical and forecasted electricity emissions data for a fee.

### Embodied Emissions

Embodied Carbon Emissions or [Embedded Emissions](https://en.wikipedia.org/wiki/Embedded_emissions) is the amount of carbon emitted during the creation and disposal of a hardware device. In order to estimate embodied emissions in the cloud, we need to calculate the fraction of the total embodied emissions that should be allocated to your particular amount of usage or workload. For example, if you are only utilizing a subset of virtual CPUs that are available on a given physical server, then we need to allocate a relative amount of embodied emissions to represent this.

To do this, we have leveraged the Software Carbon Intensity Standard recently published by the Green Software Foundation, as well as [research published](https://medium.com/teads-engineering/building-an-aws-ec2-carbon-emissions-dataset-3f0fd76c98ac) by [@github-benjamin-davy](https://github.com/github-benjamin-davy) and the team at Teads.

Right now, we are only including embodied emissions estimates for compute usage types due to limited public data being available, but welcome any contributions to apply embodied emissions to other types of cloud usage.

To understand in more detail how we are calculating embodied emissions, please read the [Embodied Emissions page](./EmbodiedEmissions.md).


### Appendix I: Energy Coefficients:

#### AWS

- Average Minimum Watts (0% CPU Utilization): 0.74
- Average Maximum Watts (100% CPU Utilization): 3.5
- Average CPU Utilization for hyperscale data centers: 50%
- HDD Storage Watt Hours / Terabyte: 0.65
- SSD Storage Watt Hours / Terabyte: 1.2
- Networking Kilowatt Hours / Gigabyte: 0.001 
- Memory Kilowatt Hours / Gigabyte: 0.000392
- Average PUE: 1.135

#### GCP

- Median Minimum Watts (0% CPU Utilization): 0.71
- Median Maximum Watts (100% CPU Utilization): 4.26
- Average CPU Utilization for hyperscale data centers: 50%
- HDD Storage Watt Hours / Terabyte: 0.65
- SSD Storage Watt Hours / Terabyte: 1.2
- Networking Kilowatt Hours / Gigabyte: 0.001
- Memory Kilowatt Hours / Gigabyte: 0.000392
- Average PUE: 1.1

#### Azure

- Average Minimum Watts (0% CPU Utilization): 0.78
- Average Maximum Watts (100% CPU Utilization): 3.76
- Average CPU Utilization for hyperscale data centers: 50%
- HDD Storage Watt Hours / Terabyte: 0.65
- SSD Storage Watt Hours / Terabyte: 1.2
- Networking Kilowatt Hours / Gigabyte: 0.001
- Memory Kilowatt Hours / Gigabyte: 0.000392
- Average PUE: 1.125

### Appendix II: Cloud provider compute processors and micro-architectures:

You can see the full list of AWS, GCP and Azure microarchitectures and min/max coefficients used for Compute [here](https://github.com/cloud-carbon-footprint/cloud-carbon-coefficients/tree/main/data).

We want to thank [@davidmytton](https://github.com/davidmytton) for collaborating with us on the creation of [this repository](https://github.com/cloud-carbon-footprint/cloud-carbon-coefficients) that calculates coefficients used in the CCF application.

**Note on AWS Graviton 2 Processor:**

When it comes to the AWS Graviton 2 custom processor, it is likely more efficient than other processors however 
we are yet to find any reliable min or max watts values. For the time being, we apply the lowest min/max watts for any microarchitecture: AMD EPYC 2nd Gen.
The same is true for the GB / physical chip used to estimate energy for memory usage.

### Appendix III: GPUs and min/max watts

| Manufacturer | Name            | Watts (Idle) | Watts (100%) |
|--------------|-----------------|--------------|--------------|
| NVIDIA       | Tesla M60       | 35           | 306          |
| NVIDIA       | T4              | 8            | 71           |
| NVIDIA       | Tesla K80       | 35           | 306          |
| NVIDIA       | Tesla V100      | 35           | 306          |
| NVIDIA       | Tesla A100      | 46           | 407          |
| NVIDIA       | K520            | 26           | 229          |
| NVIDIA       | A10G            | 18           | 153          |
| NVIDIA       | Tesla P4        | 9            | 76.5         |
| NVIDIA       | Tesla P100      | 36           | 306          |
| NVIDIA       | Tesla P40       | 30           | 255          |
| AMD          | Radeon Pro V520 | 26           | 229          |
| Xilinx       | Alveo U250      | 27           | 229.5        |

### Appendix IV: Recent Networking studies

| Study                                                                                                                                                                      | Scope                   | Year (data applied) | Energy intensity kWh/GB                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------- | -------------------------------------- |
| [Methodology To Model the Energy and Greenhouse Gas Emissions of Electronic Software Distributions](https://pubs.acs.org/doi/abs/10.1021/es202125j) Williams & Tang        | end-to-end              | 2010                | 0.13                                   |
| [Understanding the environmental costs of fixed line networking](https://dl.acm.org/doi/abs/10.1145/2602044.2602057) Krug                                                  | end-to-end              | 2012                | 0.14                                   |
| [Understanding the environmental costs of fixed line networking](https://dl.acm.org/doi/abs/10.1145/2602044.2602057) Krug                                                  | Internet core           | 2012                | 0.04                                   |
| [Electricity Intensity of Internet Data Transmission: Untangling the Estimates](https://onlinelibrary.wiley.com/doi/full/10.1111/jiec.12630) Aslan et al                   | end-to-end              | 2015                | 0.06                                   |
| [Electricity Intensity of Internet Data Transmission: Untangling the Estimates](https://onlinelibrary.wiley.com/doi/full/10.1111/jiec.12630) Aslan et al                   | Internet core           | 2015                | 0.004                                  |
| [New perspectives on internet electricity use in 2030](https://www.researchgate.net/publication/342643762_New_perspectives_on_internet_electricity_use_in_2030), A. Andrae | Fixed access network    | 2020                | 0.07 - 0.055                           |
| [Talk](https://www.youtube.com/watch?t=2520&v=Xo0PB5i_b4Y&feature=youtu.be) by J. Malmodin                                                                                 | Fixed broadband network | ?                   | 0.1 - 0.001 (depending on the bitrate) |

### Appendix V: Grid emissions factors:

#### AWS

| Region         | Country       | NERC Region | CO2e (metric ton/kWh) | Source                                                                                                                      |
| -------------- | ------------- | ----------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| us-east-1      | United States | SERC        | 0.000379069           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| us-east-2      | United States | RFC         | 0.000410608           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| us-west-1      | United States | WECC        | 0.000322167           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| us-west-2      | United States | WECC        | 0.000322167           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| us-gov-east-1  | United States | SERC        | 0.000379069           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| us-gov-west-1  | United States | WECC        | 0.000322167           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| af-south-1     | South Africa  |             | 0.0009006             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |
| ap-east-1      | Hong Kong     |             | 0.00071               | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |
| ap-south-1     | India         |             | 0.0007082             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |
| ap-northeast-3 | Japan         |             | 0.0004658             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |
| ap-northeast-2 | South Korea   |             | 0.0004156             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |
| ap-southeast-1 | Singapore     |             | 0.000408              | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf)                                             |
| ap-southeast-2 | Australia     |             | 0.00076               | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |
| ap-northeast-1 | Japan         |             | 0.0004658             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |
| ca-central-1   | Canada        |             | 0.00012               | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |
| cn-north-1     | China         |             | 0.0005374             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |
| cn-northwest-1 | China         |             | 0.0005374             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |
| eu-central-1   | Germany       |             | 0.000311              | [EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-9/#tab-chart_2)                                               |
| eu-west-1      | Ireland       |             | 0.0002786             | [EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-9/#tab-chart_2)                                               |
| eu-west-2      | England       |             | 0.000225              | [EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-9/#tab-chart_2)                                               |
| eu-south-1     | Italy         |             | 0.0002134             | [EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-9/#tab-chart_2)                                               |
| eu-west-3      | France        |             | 0.0000511             | [EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-9/#tab-chart_2)                                               |
| eu-north-1     | Sweden        |             | 0.0000088             | [EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-9/#tab-chart_2)                                               |
| me-south-1     | Bahrain       |             | 0.0005059             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |
| sa-east-1      | Brazil        |             | 0.0000617             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |

#### GCP

With GCP, there are two possible sets of grid emissions factors that the application can use, which is set using the `GCP_USE_CARBON_FREE_ENERGY_PERCENTAGE` configuration option.

1. Grid emissions factors that take into account Google's published [Carbon Free Energy percentage](https://cloud.google.com/sustainability/region-carbon) in each region. For example in us-central1, the grid emissions factor is 494 gCO2eq/kWh with CFE% of 93%. With the option above set to true, the application would instead use 31.78 gCO2eq/kWh, or 0.00003178 metric tons / kWh. We understand that applying the CFE% in this way may lead to some inaccuracies, because this figure is an hourly average percentage, and our application doesn't estimate emissions at that level of granularity. However, through internal testing we have found that overall it gets the application closer the real world distribution of emissions across GCP regions.

| Region                  | Location          | CO2e (metric ton/kWh) | Source                                                          |
| ----------------------- | ----------------- | --------------------- | --------------------------------------------------------------- |
| us-central1             | Iowa              | 0.00003178            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| us-east1                | South Carolina    | 0.0003504             | [Google](https://cloud.google.com/sustainability/region-carbon) |
| us-east4                | Northern Virginia | 0.00015162            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| us-west1                | Oregon            | 0.0000078             | [Google](https://cloud.google.com/sustainability/region-carbon) |
| us-west2                | Los Angeles       | 0.00011638            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| us-west3                | Salt Lake City    | 0.00038376            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| us-west4                | Las Vegas         | 0.00036855            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-east1              | Taiwan            | 0.0004428             | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-east2              | Hong Kong         | 0.000453              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-northeast1         | Tokyo             | 0.00048752            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-northeast2         | Osaka             | 0.00048752            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-northeast3         | Seoul             | 0.00031533            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-south1             | Mumbai            | 0.00063448            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-south2             | Delhi             | 0.000657              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-southeast1         | Singapore         | 0.00047328            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-southeast2         | Jakarta           | 0.000647              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| australia-southeast1    | Sydney            | 0.00064703            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| australia-southeast2    | Melbourne         | 0.000691              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-central2         | Warsaw            | 0.000622              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-north1           | Finland           | 0.00000798            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-west1            | Belgium           | 0.00004452            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-west2            | London            | 0.00009471            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-west3            | Frankfurt         | 0.00010841            | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-west4            | Netherlands       | 0.000164              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-west6            | Zurich            | 0.000087              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| northamerica-northeast1 | Montreal          | 0.000027              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| southamerica-east1      | Sao Paulo         | 0.00001236            | [Google](https://cloud.google.com/sustainability/region-carbon) |

2. Grid emissions factors that don't take into account Google's published Carbon Free Energy percentage. Given the potential inaccuracies in applying the CFE % mentioned above, we include an option to just use the grid emissions factors published by Google, without factoring the CFE %.  

| Region                  | Location          | CO2e (metric ton/kWh) | Source                                                          |
| ----------------------- | ----------------- | --------------------- | --------------------------------------------------------------- |
| us-central1             | Iowa              | 0.000454              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| us-east1                | South Carolina    | 0.00048               | [Google](https://cloud.google.com/sustainability/region-carbon) |
| us-east4                | Northern Virginia | 0.000361              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| us-west1                | Oregon            | 0.000078              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| us-west2                | Los Angeles       | 0.000253              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| us-west3                | Salt Lake City    | 0.000533              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| us-west4                | Las Vegas         | 0.000455              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-east1              | Taiwan            | 0.00054               | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-east2              | Hong Kong         | 0.000453              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-northeast1         | Tokyo             | 0.000554              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-northeast2         | Osaka             | 0.000442              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-northeast3         | Seoul             | 0.000457              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-south1             | Mumbai            | 0.000721              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-south2             | Delhi             | 0.000657              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-southeast1         | Singapore         | 0.000493              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| asia-southeast2         | Jakarta           | 0.000647              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| australia-southeast1    | Sydney            | 0.000727              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| australia-southeast2    | Melbourne         | 0.000691              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-central2         | Warsaw            | 0.000622              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-north1           | Finland           | 0.000133              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-west1            | Belgium           | 0.000212              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-west2            | London            | 0.000231              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-west3            | Frankfurt         | 0.000293              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-west4            | Netherlands       | 0.00041               | [Google](https://cloud.google.com/sustainability/region-carbon) |
| europe-west6            | Zurich            | 0.000087              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| northamerica-northeast1 | Montreal          | 0.000027              | [Google](https://cloud.google.com/sustainability/region-carbon) |
| southamerica-east1      | Sao Paulo         | 0.000103              | [Google](https://cloud.google.com/sustainability/region-carbon) |

#### Azure

**Note**: The application currently only supports a subset of Azure regions that are used by Thoughtworks.
This is because the syntax in which they are returned from the Azure Consumption API doesn't always match what is listed in the [Azure website](https://azure.microsoft.com/en-us/global-infrastructure/geographies).
For example, the website says "West US 2", but the API provides the region as "uswest2". In the case of "UK South",
it is the same on both the website and the API. For any Azure customers using other regions, we would love to know what
syntax is returned by the API for your region(s) so that we can add support for them. You can email [green-cloud@thoughtworks.com](mailto:green-cloud@thoughtworks.com),
or submit an issue or pull request.

| Region           | Location    | NERC Region | CO2e (metric ton/kWh) | Source                                                                                                                      |
| ---------------- | ----------- | ----------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Central US*      | Iowa        | MRO         | 0.000426254           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| East US*         | Virginia    | SERC        | 0.000379069           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| East US 2*       | Virginia    | SERC        | 0.000379069           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| East US 3        | Georgia     | SERC        | 0.000379069           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| North Central US*| Illinois    | RFC         | 0.000410608           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| South Central US*| Texas       | TRE         | 0.000373231           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| West Central US  | Wyoming     | WECC        | 0.000322167           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| West US*         | California  | WECC        | 0.000322167           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| West US 2*       | Washington  | WECC        | 0.000322167           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| West US 3        | Arizona     | WECC        | 0.000322167           | [EPA](https://www.epa.gov/egrid/download-data)                                                                              |
| East Asia*       | Hong Kong   |             | 0.00071               | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf)  |
| Southeast Asia*  | Singapore   |             | 0.000408              | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf)  |                                             
| South Africa North      | Johannesburg |     | 0.0009006             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf)  |
| South Africa West      | South Africa  |     | 0.0009006             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf)  |
| South Africa    | South Africa       |       | 0.0009006             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf)  | 
| Australia      | Australia           |       | 0.00079               | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf)  | 
| Australia Central     | Canberra     |       | 0.00079               | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf)  | 
| Australia Central 2   | Canberra     |       | 0.00079               | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf)  | 
| Australia East | New South Wales     |       | 0.00079               | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) | 
| Australia South East     | Victoria  |       | 0.00096               | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) | 
| Japan          | Japan               |       | 0.0004658             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) | 
| Japan West     | Osaka               |       | 0.0004658             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) | 
| Japan East     | Tokyo, Saitama      |       | 0.0004658             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) | 
| Korea          | Korea               |       | 0.0004156             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) | 
| Korea East     | Korea               |       | 0.0004156             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) | 
| Korea South    | Korea               |       | 0.0004156             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) | 
| India          | India               |       | 0.0007082             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) | 
| India West*    | Mumbai              |       | 0.0007082             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) | 
| India Central* | Pune                |       | 0.0007082             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) | 
| India South    | Chennai             |       | 0.0007082             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) | 
| North Europe   | Ireland             |       | 0.0002786             | [EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-9/#tab-chart_2)                                               |
| West Europe    | Netherlands         |       | 0.0003284             | [EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-9/#tab-chart_2)                                               |
| France         | France              |       | 0.00005128            | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| France Central | Paris               |       | 0.00005128            | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| France South   | France              |       | 0.00005128            | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Sweden Central | Gävle and Sandviken |       | 0.00000567            | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Switzerland    | Switzerland         |       | 0.00000567            | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Switzerland North     | Zürich       |       | 0.00000567            | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Switzerland West      | Switzerland  |       | 0.00000567            | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| UK             | United Kingdom      |       | 0.000225              | [EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-9/#tab-chart_2)                                               |
| UK South       | London              |       | 0.000225              | [EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-9/#tab-chart_2)                                               |
| UK West        | Cardiff             |       | 0.000228              | [EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-9/#tab-chart_2)                                               |
| Germany        | Germany             |       | 0.00033866            | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Germany North  | Germany             |       | 0.00033866            |  [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Germany West Central   | Frankfurt   |       | 0.00033866            | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Norway         | Norway              |       | 0.00000762            | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Norway East    | Oslo                |       | 0.00000762            | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Norway West    | Norway              |       | 0.00000762            | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| United Arab Emirates | United Arab Emirates || 0.0004041             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| United Arab Emirates North  | Dubai  |       | 0.0004041             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| United Arab Emirates Central   | United Arab Emirates | | 0.0004041  | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Canada         | Canada              |       | 0.00012               | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Canada Central | Toronto             |       | 0.00012               | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Canada East    | Quebec City         |       | 0.00012               | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Brazil         | Brazil              |       | 0.0000617             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Brazil South   | São Paulo State     |       | 0.0000617             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               
| Brazil South East   | Brazil         |       | 0.0000617             | [carbonfootprint.com](https://www.carbonfootprint.com/docs/2022_03_emissions_factors_sources_for_2021_electricity_v11.pdf) |                                               

*These regions may contain sub-regions for alternative data centers within that same location (i.e. North Central US Stage). These sub-regions share the same carbon intensity as the primary region.
<!-- © 2021 Thoughtworks, Inc. -->
