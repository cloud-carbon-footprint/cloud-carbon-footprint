# Methodology

### Table of Contents
[Summary](#summary)

[Longer Version](#longer-version)

* [A note on our approach](#a-note-on-our-approach)
  
* [Options for cloud usage and cost data source](#options-for-cloud-usage-and-cost-data-source)
    
    * [1. Using Billing Data for Cloud Usage (Holistic)](#1-using-billing-data-for-cloud-usage-holistic)
    
    * [2. Using Cloud Usage APIs for Cloud Usage (Higher Accuracy)](#2-using-cloud-usage-apis-for-cloud-usage-higher-accuracy)

* [Energy Estimate (Watt-Hours)](#energy-estimate-watt-hours)

    * [Compute](#compute)
    
        * [A note on AWS Lambda Compute Estimates](#a-note-on-aws-lambda-compute-estimates)
          
        * [A note on AWS Aurora Serverless Compute Estimates](#a-note-on-aws-aurora-serverless-compute-estimates)
    
    * [Storage](#storage)

* [Carbon Estimates (CO2e)](#carbon-estimates-co2e)

* [Appendix I: Processor lists](#appendix-i-aws--gcp-processor-list)

* [Appendix II: Grid emissions factors](#appendix-ii-grid-emissions-factors)


## Summary
Global greenhouse gas emissions from the tech sector are on par or larger than the aviation industry, at around 
[3% for ICT](https://c2e2.unepdtu.org/wp-content/uploads/sites/3/2020/03/greenhouse-gas-emissions-in-the-ict-sector.pdf)
 and [2% for aviation](https://www.atag.org/facts-figures.html) respectively. Within ICT, data centers consume around 1% 
 of greenhouse gas emissions and 
[global electricity usage](https://www.iea.org/reports/data-centres-and-data-transmission-networks).
Currently most cloud providers do not disclose energy  or carbon emissions from cloud usage to their customers 
(at an aggregate or individual level), which can be a challenge  for organizations who want to baseline and reduce 
their carbon footprint. This application is a starting point to enable organizations to have greater visibility into 
their emissions across multiple cloud providers.

There are currently no guidelines for reporting Scope 3 emissions as part of the Greenhouse Gas (GHG) Protocol, which 
cloud provider usage would fall under. However we hope more and more organizations report on both location-based and 
market-based emissions from cloud usage. To that end, this application’s focus is on providing a location-based cloud 
emissions estimate, and we welcome contributions that could aid with market-based reporting to include energy attributes 
such as RECs or power purchasing agreements. 

This application pulls usage data (compute, storage, networking, etc) from major cloud providers and calculates 
estimated energy (Watt-Hours) and greenhouse gas emissions expressed as  carbon dioxide equivalents (metric tons CO2e). We 
display these visualizations in a dashboard for developers, sustainability leaders and other stakeholders in an 
organization to view and take action. It currently supports AWS and Google Cloud, and we have Azure also on the roadmap.

**We calculate our CO2e estimates with this formula:**  

    (Cloud provider service usage) x (Cloud provider Power Usage Effectiveness (PUE)) x 
    (Cloud energy conversion factors [kWh]) x  (EPA [US] or carbonfootprint.com [Non-US] grid emissions factors [CO2e])

Our approach builds upon 
[Etsy's Cloud Jewels](https://codeascraft.com/2020/04/23/cloud-jewels-estimating-kwh-in-the-cloud/) 
(cloud energy conversion factors). Like Etsy, we currently estimate CO2e emissions for cloud compute and storage 
services. Networking and memory services usage are not estimated yet due to their arguably comparatively small footprint and 
current lack of available energy conversion factors. We similarly use point estimates without confidence intervals due 
to the experimental nature of the project, which are not meant as a replacement for data from cloud providers and we 
cannot guarantee their accuracy.  We encourage and welcome any improvements and extensions to both the methodology and 
software.

## Longer Version

### A note on our approach

Our application is designed to be a starting point which can be extended and customized for individual organizations' 
needs. Every organization will have a different cloud setup and tech stack, so we are using domain driven design to 
separate the estimation logic from both the data input source (e.g. cloud APIs, on-premise or co-located data centers) 
and the output source (e.g front-end dashboard, CSV, etc) so new inputs and outputs can easily be added. 

### Options for cloud usage and cost data source
We support two approaches to gathering usage and cost data for different cloud providers. One approach gives a more holistic understanding of your emissions whereas the other prioritizes accuracy:

#### 1. Using Billing Data for Cloud Usage (Holistic)
By default, we query AWS Cost and Usage Reports with Amazon Athena, and GCP Billing Export Table using BigQuery. This pulls usage and cost data from all linked accounts in your AWS or GCP Organization. This approach provides us with a more holistic estimation of your cloud energy and carbon consumption, but may be less accurate as we use an average constant (rather than measured) CPU Utilization.

Before estimating the energy and carbon emission, we validate whether a given usage is Compute, Storage, Networking, Memory or Unknown, and currently only the Compute and Storage usage types are fed into the estimation formula. You can see our classifications of these usage types in server/src/services/aws/CostAndUsageTypes.ts for AWS and server/src/services/gcp/BillingExportTypes.ts for GCP. 

The process by which we classified the usage types is:
1. Consider the pricing (AWS) or usage (GCP) unit: if it is hours or seconds, it is likely to be a Compute usage type. If it is byte-seconds or GigaByte-Months, it is likely to be Storage. Most other units are ignored. 
1. We then further validate whether a line item is Compute or Storage by looking at the more detailed usage type. E.g. if it contains content like “RAM” or “Networking”, it would be ignored.

You can see more details about this logic in server/src/services/aws/CostAndUsageReports.ts AWS and server/src/services/gcp/BillingExportTable.ts for GCP. We welcome additions, improvements or suggested changes to these classifications or the process.

The way we determine total vCPU Hours for the compute estimation is different for each cloud provider. For AWS we multiply the usage amount by the product vCPUs, because our understanding is that the usage amount doesn’t include the vCPU count for a given usage row. For GCP, our understanding is that the vCPU count is included in the usage amount for a given row, so we simply use the usage amount by itself.

For AWS Savings Plans, we only include the line item type `SavingsPlanCoveredUsage` because our understanding is that the other Savings Plans line item types refers to fees or discounts in the form of refunds. 

When calculating total kilowatt hours for AWS Lambda service using Billing Data (Holistic), we are assuming that `MemorySetInMB` will be 1792, and since we will then divide this by the constant 1792, we just don't include it in the calculation.

#### 2. Using Cloud Usage APIs for Cloud Usage (Higher Accuracy)
This approach utilizes the AWS CloudWatch and Cost Explore APIs, and the GCP Cloud Monitoring API to pull usage and cost data. We achieve this by looping through the accounts and then making the API calls on each account for the regions and services set in the application configuration. We retrieve an hourly granularity for usage and daily granularity for cost. This approach is arguably more accurate as we use the actual CPU usage in the emission estimation but is confined to the services that have been implemented so far in the application.

The cloud providers and services currently supported with this approach are: 

AWS 
* EC2 (compute)
* Lambda (compute)
* EBS (storage)
* RDS (compute & storage)
* S3 (storage)
* Elasticache (compute)  

GCP 
* Compute Engine (compute)


### Energy Estimate (Watt-Hours) 

In order to estimate energy used by cloud providers we are leveraging the methodology that Etsy created called "[Cloud 
Jewels](https://codeascraft.com/2020/04/23/cloud-jewels-estimating-kwh-in-the-cloud/)" to determine energy coefficients 
(kWh) for cloud service usage. Like Etsy’s approach, our application currently only supports energy estimates for cloud 
compute and storage, and not memory or networking. This is because we are yet to find actionable public research for 
these types of usage, and typically they contribute a small fraction of a cloud customer’s overall energy use. The 
application also doesn’t currently include estimations for cloud GPU usage, but this is on the roadmap. 

We look at the servers used by cloud providers on their website and reference their energy usage from both the 
[SPECPower](https://www.spec.org/power_ssj2008/results/power_ssj2008.html) database and the [2016 US Data Center Energy 
Usage Report](https://eta.lbl.gov/publications/united-states-data-center-energy). Etsy looked into GCP servers and we 
have additionally looked into AWS servers; see list of processors below in Appendix I. Of course this does not account 
for any custom processors (such as AWS has) however this is the best information we found publicly available. 

#### Compute
For Compute estimation, we follow the same formula as Cloud Jewels, which can be broken down into 2 steps. (We recommend 
reading their article for a deeper explanation). 
     
First, we calculate Average Watts which is the average compute energy at a moment in time. When a server is idle, 
it still takes some power to run it (Minimum Watts). As the server utilization increases the amount of power 
consumed increases too. The total energy used is the min watts plus the watts from additional server usage (average per 
hour).
     
     Average Watts = Min Watts + Avg vCPU Utilization  * (Max Watts - Min Watts)
     
Second, we then translate this into total Watt Hours based on the amount of time servers are being used, or 
virtual CPU hours, and the cloud provider’s Power Usage Effectiveness (PUE) score, ie. how energy efficient their data 
centers are.  
     
     Compute Watt-Hours = Average Watts * vCPU Hours * Cloud Provider Power Usage Effectiveness (PUE)

Here are the input data sources for the variables in the formula, and context on where we have sourced them:

* **Min Watts** (constant) - This is dependent on the CPU processor used by the Cloud provider to host the virtual machines. 
Based on publicly available information about which CPUs cloud providers use, we looked up the 
[SPECPower](https://www.spec.org/power_ssj2008/results/power_ssj2008.html) database to determine this constant.
* **Max Watts** (constant) - Same as Min Watts, above. 
* **Avg vCPU** Utilization (variable or constant) - This is either pulled from the cloud usage APIs or is a constant when using billing data. 
* **vCPU Hours** (variable) - This is pulled from the cloud usage APIs or billing data .
* **PUE** (constant) - PUE is a score of how energy efficient a data center is, with the lowest possible score of 1 meaning
 all energy consumed goes directly to powering the servers and none is being wasted on cooling. This is based on 
 publicly available information provided by the cloud providers. In the case of GCP, they 
 [publish their PUE](https://cloud.google.com/sustainability). In the case of AWS, we have made a conservative guess 
 [based on public information](https://aws.amazon.com/blogs/aws/cloud-computing-server-utilization-the-environment/). 

When the actual Avg vCPU Utilization for a given time period isn’t available from a cloud provider's API, we fall back 
to a projected estimate for the average server utilization of servers in hyperscale data centers in 2020 of 50%, from 
the [2016 U.S. Data Center Energy Usage Report](https://eta.lbl.gov/publications/united-states-data-center-energy). For 
example, this may occur for AWS EC2 instances that are terminated over 2 weeks ago from when the application first 
queries an AWS Account. 

Here are the compute constants used for each cloud provider: 

**AWS:**
* Min Watts: 0.59
* Max Matts: 3.5
* PUE: 1.2

**GCP:**
* Min Watts: 0.58
* Max Watts: 3.54
* PUE: 1.11


##### A note on AWS Lambda Compute Estimates

In the case of AWS Lambda, AWS does not provide metrics for CPU Utilization and number of vCPU hours, so we need 
to take an alternative approach. 

Lambdas can consume between 128MB and 10,240MB in 1MB increments 
[\[source\]](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html). At 1,792MB a lambda has an 
equivalent of one vCPU [\[source\]](https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html). Above 
this another vCPU is assigned up to a total of 6 vCPUs, and we can estimate the number of vCPUs allocated to a lambda function as a ratio of the 
allocated memory over 1,792MB. 

Given this, the formula we derive is:

    Total Watt-Hours = Average Watts X Running Time (Hours) X Estimated number of vCPUs X Cloud Provider Power Usage Effectiveness (PUE)
where: 

    Average Watts = Min Watts + 50% (Average for hyperscale data centers) * (Max Watts - Min Watts)
    Running Time = Lambda execution time / 3600 seconds 
    Estimated number of vCPUs = Lambda memory allocated (MB) / 1,792 MB

The execution time and memory allocated are both pulled from the Cost and Usage Reports or CloudWatch Lambda Logs. 

##### A note on AWS Aurora Serverless Compute Estimates

In the case of AWS Aurora Serverless using the Cost and Usage Reports, the pricing unit is `ACU-Hrs`. 1 ACU has 
approximately 2 GB of memory with corresponding CPU and networking, similar to what is used in Aurora user-provisioned 
instances [\[source\]](https://aws.amazon.com/rds/aurora/pricing/). Looking at the most recent Aurora instance classes, 
the number of vCPUs provisioned is directly proportional to the amount of memory - roughly one eighth 
[\[source\]](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.DBInstanceClass.html).

Given that, for every ACU Hour, we estimate that 0.25 vCPUs are provisioned (2 GB of memory divided by 8). So for 
Compute estimations, the application treats every 4 ACU-Hours as one vCPU Hour.  


#### Storage

For storage, we also follow the same methodology as Cloud Jewels by deriving a Wh/Tbh coefficient for both HDD and SSD 
storage types. However we updated the coefficients to be more accurate for the year 2020, based projections from the 
same 2016 U.S Data Center Usage Report.

Here is the estimated HDD energy usage:

* HDD average capacity in 2020 = **10** Terabytes per disk 
* Average wattage per disk for 2020 = **6.5** Watts per disk
        
        Watts per Terabyte = Watts per disk / Terabytes per disk:
        6.65 W / 10 TB = **0.65 Watt-Hours per Terabyte-Hour for HDD**

Here is the estimated SSD energy usage:

* SSD average capacity in 2020 = **5** Terabytes per disk 
* Average wattage per disk for 2020 = **6** Watts per disk

        Watts per terabyte = Watts per disk / Terabytes per disk: 
        6 W / 5 TB = 1.2 Watt-Hours per Terabyte-Hour for SSD

When it comes to measuring the Terabytes from cloud providers, we query for the allocated bytes rather than the utilized
bytes, because this is a more accurate reflection of the energy needed to support that usage. For example, an 
organization may have a 20 Gigabyte AWS EBS Volume allocated, but is only utilizing 2 Gigabytes for this block storage 
device. In this case we would use 20 GBs in the energy estimation formula for EBS storage. 

### Carbon Estimates (CO2e)
Once we have the estimated kilowatt hours for usage of a given cloud provider, we then convert that into estimated CO2e 
using publicly available data on emission factors for a given electricity grid based on the mix of local energy sources.
We do this based on the cloud provider datacenter region that each service is running in. 

In the United States, we use the EPA’s [eGRID2018v2 Data](https://www.epa.gov/egrid/download-data) that 
provides NERC region specific emission factors annual for CO2e. We decided to use the NERC region emission factors rather
than the more granular eGRID subregion or state emissions factors because we feel that it better represents the energy 
consumed by data centers, rather than the energy produced in a given state/subregion which those metrics would more 
adequately reflect. Outside the US, we either use carbonfootprint.com’s [country specific grid emissions factors 
report](https://www.carbonfootprint.com/), or for most regions in Europe the [EEA's country level emissions factors](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6).
In the case of Singapore, we get the data from the [Energy Market Authority’s electricity grid emissions 
factors](https://www.ema.gov.sg/singapore-energy-statistics/Ch02/index2), and for Taiwan we got it from this 
[energypedia.info](https://energypedia.info/wiki/Energy_Transition_in_Taiwan#cite_note-19) as neither are included in 
the carbonfootprint.com's report. You can see the full list of emissions factors in Appendix II below. 

We understand this is a rough estimated conversion as these are only averages over a given year that is pre-2020, and 
they also don’t take into account time of day. We welcome improvements to this, for example [electrictyMap 
API](https://api.electricitymap.org/) provides hourly historical and forecasted electricity emissions data for a fee. 


### Appendix I: AWS & GCP processor list:
#### AWS processor list
* Intel Xeon:  https://aws.amazon.com/intel/
* Intel Xeon® E5-2676 Processors
* Intel Xeon® E5-2686 Processors
* Intel® Xeon® E5-2686 v4 Processors
* Intel Xeon® E5-2666 Processors
* Intel® Xeon® E7 8880 v3 Processors
* Intel® Xeon® Platinum 8124M Processors
* Intel® Xeon® Platinum 8151 Processors
* Intel® Xeon® Platinum 8175 Processors
* Intel® Xeon® Platinum 8175M
* Intel® Xeon® Platinum 8176M
* Intel® Xeon® Scalable Processors
	
AMD EPYC: https://aws.amazon.com/ec2/amd/
* 1st Gen
* 2nd Gen
	
#### GCP processor list	
* Intel Xeon: https://cloud.google.com/compute/docs/cpu-platforms
* Intel Xeon Scalable Processor (Cascade Lake)
* Intel Xeon Scalable Processor (Skylake)
* Intel Xeon E7 (Broadwell E7)
* Intel Xeon E5 v4 (Broadwell E5)
* Intel Xeon E5 v3 (Haswell)
* Intel Xeon E5 v2 (Ivy Bridge)
* Intel Xeon E5 (Sandy Bridge)
* AMD EPYC: https://cloud.google.com/compute/docs/cpu-platforms
* AMD EPYC 2nd Gen (Rome)
 
### Appendix II: Grid emissions factors:
 
#### AWS
 |Region|Country|NERC Region|CO2e (metric ton/kWh)|Source|
 |------|-------|-----------|------------|------|
 |us-east-1|United States|SERC|0.0004545|[EPA](https://www.epa.gov/egrid/download-data)|
 |us-east-2|United States|RFC|0.000475105|[EPA](https://www.epa.gov/egrid/download-data)|
 |us-west-1|United States|WECC|0.000351533|[EPA](https://www.epa.gov/egrid/download-data)|
 |us-west-2|United States|WECC|0.000351533|[EPA](https://www.epa.gov/egrid/download-data)|
 |us-gov-east-1|United States|SERC|0.0004545|[EPA](https://www.epa.gov/egrid/download-data)|
 |us-gov-west-1|United States|WECC|0.000351533|[EPA](https://www.epa.gov/egrid/download-data)|
 |af-south-1|South Africa| |0.000928|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |ap-east-1|Hong Kong| |0.00081|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |ap-south-1|India| |0.000708|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |ap-northeast-3|Japan| |0.000506|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |ap-northeast-2|South Korea| |0.0005|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |ap-southeast-1|Singapore| |0.0004085|[EMA Singapore](https://www.ema.gov.sg/singapore-energy-statistics/Ch02/index2)
 |ap-southeast-2|Australia| |0.00079|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |ap-northeast-1|Japan| |0.000506|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |ca-central-1|Canada| |0.00013|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |cn-north-1|China| |0.000555|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |cn-northwest-1|China| |0.000555|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |eu-central-1|Germany| |0.000338|[EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6)|
 |eu-west-1|Ireland| |0.000316|[EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6)|
 |eu-west-2|England| |0.000228|[EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6)|
 |eu-south-1|Italy| |0.000233|[EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6)|
 |eu-west-3|France| |0.000052|[EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6)|
 |eu-north-1|Sweden| |0.000008|[EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6)|
 |me-south-1|Bahrain| |0.000732|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |sa-east-1|Brazil| |0.000074|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|

#### GCP
 |Region|Country|NERC Region|CO2e (metric ton/kWh)|Source|
 |------|-------|-----------|------------|------|
 |us-central1|USA|MRO|0.000540461|[EPA](https://www.epa.gov/egrid/download-data)|
 |us-east1|USA|SERC|0.0004545|[EPA](https://www.epa.gov/egrid/download-data)|
 |us-east4|USA|SERC|0.0004545|[EPA](https://www.epa.gov/egrid/download-data)|
 |us-west1|USA|WECC|0.000351533|[EPA](https://www.epa.gov/egrid/download-data)|
 |us-west2|USA|WECC|0.000351533|[EPA](https://www.epa.gov/egrid/download-data)|
 |us-west3|USA|WECC|0.000351533|[EPA](https://www.epa.gov/egrid/download-data)|
 |us-west4|USA|WECC|0.000351533|[EPA](https://www.epa.gov/egrid/download-data)|
 |asia-east1|Taiwan| |0.000544|[energypedia](https://energypedia.info/wiki/Energy_Transition_in_Taiwan#cite_ref-20)|
 |asia-east2|Hong Kong| |0.00081|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |asia-northeast1|Japan| |0.000506|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |asia-northeast2|Japan| |0.000506|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |asia-northeast3|South Korea| |0.0005|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |asia-south1|India| |0.000708|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |asia-southeast1|Singapore| |0.0004085|[EMA Singapore](https://www.ema.gov.sg/singapore-energy-statistics/Ch02/index2)|
 |asia-southeast2|Indonesia| |0.000761|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |australia-southeast1|Australia| |0.00079|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |europe-north1|Finland| |0.000086|[EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6)|
 |europe-west1|Belgium| |0.000167|[EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6)|
 |europe-west2|England| |0.000228|[EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6)|
 |europe-west3|Germany| |0.000338|[EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6)|
 |europe-west4|Netherlands| |0.000390|[EEA](https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6)|
 |europe-west6|Switzerland| |0.00001182|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |northamerica-northeast1|Canada| |0.00013|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 |southamerica-east1|Brazil| |0.000074|[carbonfootprint.com](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf)|
 
© 2020 ThoughtWorks, Inc. All rights reserved.
