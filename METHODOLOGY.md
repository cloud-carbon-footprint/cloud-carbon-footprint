# Methodology

### Table of Contents
[Summary](#summary)

[Longer Version](#longer-version)

* [A note on our approach](#a-note-on-our-approach)

* [Cloud Usage & Cost](#cloud-usage-&-cost)

    * [AWS](#aws)
    
    * [GCP](#gcp)

    * [Authentication & Authorization](#authentication-&-authorization)

* [Energy Estimate (Watt-Hours)](#energy-estimate-watt-hours)

    * [Compute](#compute)
    
        * [A note on AWS Lambda Compute Estimates](#a-note-on-aws-lambda-compute-estimates)
    
    * [Storage](#storage)

* [Carbon Estimates (CO2e)](#carbon-estimates-co2e)

* [Appendix](#appendix-aws-processor-list)

    * [AWS processor list](#aws-processor-list)
    
    * [GCP processor list](#gcp-processor-list)


## Summary
Global greenhouse gas emissions from the tech sector are on par or larger than the aviation industry, at around 
[3% for ICT](https://c2e2.unepdtu.org/wp-content/uploads/sites/3/2020/03/greenhouse-gas-emissions-in-the-ict-sector.pdf)
 and [2% for aviation](https://www.atag.org/facts-figures.html) respectively. Within ICT, data centers consume around 1% 
 of greenhouse gas emissions and 
[2% of global electricity usage](https://www.forbes.com/sites/ibm/2019/12/09/ibm-tech-trends-to-watch-in-2020--and-beyond/?sh=a3cd0db4c1cf).
Currently most cloud providers do not disclose energy  or carbon emissions from cloud usage to their customers 
(at an aggregate or individual level), which can be a challenge  for organizations who want to baseline and reduce 
their carbon footprint. This application is a starting point to enable organizations to have greater visibility into 
their emissions across multiple cloud providers.

This application pulls usage data (compute, storage, networking, etc) from major cloud providers and calculates 
estimated energy (Watt-Hours) and greenhouse gas emissions expressed as  carbon dioxide equivalents (kgs CO2e). We 
display these visualizations in a dashboard for developers, sustainability leaders and other stakeholders in an 
organization to view and take action. It currently supports a number of commonly used AWS services. We are in the 
process of adding support for GCP services, and have Azure also on the roadmap.

**We calculate our CO2e estimates with this formula:**  

    (Cloud provider service usage) x (Cloud provider Power Usage Effectiveness (PUE)) x 
    (Cloud energy conversion factors [Wh]) x  (EPA [US] or carbonfootprint.com [Non-US] grid emissions factors [CO2e])

Our approach builds upon 
[Etsy's Cloud Jewels](https://codeascraft.com/2020/04/23/cloud-jewels-estimating-kwh-in-the-cloud/) 
(cloud energy conversion factors). Like Etsy, we currently estimate CO2e emissions for cloud compute and storage 
services. Networking and memory services usage are not estimated yet due to their comparatively small footprint and 
current lack of available energy conversion factors. We similarly use point estimates without confidence intervals due 
to the experimental nature of the project, which are not meant as a replacement for data from cloud providers and we 
cannot guarantee their accuracy.  We encourage and welcome any improvements and extensions to both the methodology and 
software.

## Longer Version

### A note on our approach

Our application is designed to be a starting point which can be extended and customized for individual organization’s 
needs. Every organization will have a different cloud setup and tech stack, so we are using domain driven design to 
separate the estimation logic from both the data input source (e.g. cloud APIs, on-premise or co-located data centers) 
and the output source (e.g front-end dashboard, CSV, etc) so new inputs and outputs can easily be added. 

The cloud providers and services currently supported are: 

**AWS** 
* EC2 (compute)
* Lambda (compute)
* EBS (storage)
* RDS (compute & storage)
* S3 (storage)
* Elasticache (compute)

**GCP**
* Compute Engine (compute)

We started with AWS because it is the largest cloud provider by market share. We chose these services because they are 
some of the most commonly used services, and a number of other services are abstractions of these. For example, Elastic 
Container Service (ECS) and Elastic Kubernetes Services (EKS) are implemented with EC2 instances and EBS volumes, so 
this usage will also be shown (however currently not labelled separately). 

### Cloud Usage & Cost

Our application pulls usage and cost information from cloud providers APIs. We use read-only permissions to access the 
information for each cloud account configured to be used in the application. Our application pulls the data daily to 
balance providing up to date information with overhead cost. We retrieve an hourly granularity for usage and daily 
granularity for cost. Cost data is displayed directly and usage data is fed into our estimation formula.

##### AWS

For AWS, the application pulls the following data points: 

CloudWatch API:
* Metrics (for compute related services only)
    * CPU Utilization 
    * Number of vCPU Hours
* Logs (for Lambda only):
    * Duration of Execution
    * Memory Size Allocated
    
Cost Explorer API:
 * Gigabytes in Storage (for storage related services only)
 * Amortized Cost
 
##### GCP
For GCP, the application pulls the following data points:

Cloud Monitoring API:
* CPU Utilization
* Number of vCPU Hours

We don’t currently support Cost related data points for GCP. 

### Authentication & Authorization

The application needs read permission to make the following API calls for each cloud provider: 

**AWS**
* cloudwatch:GetMetricData
* cloudwatch:GetMetricStatistics
* ce:GetCostAndUsage
* logs:DescribeLogGroups
* logs:StartQuery
* logs:GetQueryResults
* logs:StopQuery

**GCP**
* Cloud Monitoring - listTimeSeries

If an organization does not want to provide read permissions to this application directly, they could explore importing 
the data from a dump to S3, a CSV file, or other means that works best for their workflow. 

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
have additionally looked into AWS servers; see [appendix](#appendix-aws-processor-list). Of course this does not account 
for any custom processors (such as AWS has) however this is the best information we found publicly available. 

#### Compute
For Compute estimation, we follow the same formula as Cloud Jewels, which can be broken down into 2 steps. (We recommend 
reading their article for a deeper explanation). 
     
First, we calculate Average Watts which is the average compute energy at a moment in time. When a server is idle, 
it still takes some power to run it (Minimum Watts). As the server utilization increases the amount of power 
consumed increases too. The total energy used is the min watts plus the watts from additional server usage (average per 
hour).
     
     Average Watts = Min Watts + Avg vCPU Utilization  * (Max Watts - Min Watts)
     
Second, we then translate this into total Watt Hours based on the on the amount of time servers are being used, or 
virtual CPU hours, and the cloud provider’s Power Usage Effectiveness (PUE) score, ie. how energy efficient their data 
centers are.  
     
     Compute Watt-Hours = Average Watts * vCPU Hours * Cloud Provider Power Usage Effectiveness (PUE)

Here are the input data sources for the variables in the formula, and context on where we have sourced them:

* Min Watts (constant) - This is dependent on the CPU processor used by the Cloud provider to host the virtual machines. 
Based on publicly available information about which CPUs cloud providers use, we looked up the 
[SPECPower](https://www.spec.org/power_ssj2008/results/power_ssj2008.html) database to determine this constant.
* Max Watts (constant) - same as Min Watts, above. 
* Avg vCPU Utilization (variable) - this pulled from the cloud provider APIs (see above). 
* vCPU Hours (variable) - this is pulled from the cloud provider APIs (see above).
* PUE (constant) - PUE is a score of how energy efficient a data center is, with the lowest possible score of 1 meaning
 all energy consumed goes directly to powering the servers and none is being wasted on cooling. This is based on 
 publicly available information provided by the cloud providers. In the case of GCP, they 
 [publish their PUE](https://cloud.google.com/sustainability). In the case of AWS, we have made a conservative guess 
 [based on public information](https://aws.amazon.com/blogs/aws/cloud-computing-server-utilization-the-environment/). 

When the actual Avg vCPU Utilization for a given time period isn’t available from a cloud provider's API, we fall back 
to a projected estimate for the average server utilization of servers in hyperscale data centers in 2020 of 50%, from 
the [2016 U.S. Data Center Energy Usage Report](https://eta.lbl.gov/publications/united-states-data-center-energy). For 
example, this may occur for AWS EC2 instances that are terminated over 2 weeks ago from when the application first 
queries an AWS Account. 

The application doesn’t currently include estimations for cloud GPU usage, but this is on the roadmap.

##### A note on AWS Lambda Compute Estimates

In the case of AWS Lambda, CloudWatch does not provide metrics for CPU Utilization and number of vCPU hours, so we need 
to take an alternative approach. 

Lambdas can consume between 128MB to 3,008MB memory in 64MB increments 
[\[source\]](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html). At 1,792MB a lambda has an 
equivalent of one full vCPU [\[source\]](https://docs.aws.amazon.com/lambda/latest/dg/configuration-console.html). Above 
this another vCPU is assigned and we can estimate the number of vCPUs allocated to a lambda function as a ratio of the 
allocated memory over 1,792MB. 

Given this, the formula we derive is:

    Total Watt-Hours = Running Time (Hours) X Max Watts X Estimated number of vCPUs
where: 

    Running Time = Lambda execution time / 3600 seconds 
    Max Watts = the same constant used above. 
    Estimated number of vCPUs = Lambda memory allocated (MB) / 1,792 MB

The execution time and memory allocated are both pulled from the CloudWatch Lambda Logs. 

#### Storage

For storage, we also follow the same methodology as Cloud Jewels by deriving a Wh/Tbh coefficient for both HDD and SSD 
storage types. However we updated the coefficients to be more accurate for the year 2020, based projections from the 
same 2016 U.S Data Center Usage Report.

Here is the estimated HDD energy usage:

* HDD average capacity in 2020 = **10** Terabytes per disk 
* Average wattage per disk for 2020 = **6.65** Watts per disk
        
        Watts per Terabyte = Watts per disk / Terabytes per disk:
        6.65 W / 10 TB = **0.665 Watt-Hours per Terabyte for HDD**

Here is the estimated SSD energy usage:

* SSD average capacity in 2020 = **5** Terabytes per disk 
* Average wattage per disk for 2020 = **6** Watts per disk

        Watts per terabyte = Watts per disk / Terabytes per disk: 
        6 W / 5 TB = 1.2 Watt-Hours per Terabyte for SSD

When it comes to measuring the Terabytes from cloud providers, we query for the allocated bytes rather than the utilized
bytes, because this is a more accurate reflection of the energy needed to support that usage. For example, an 
organization may have a 20 Gigabyte AWS EBS Volume allocated, but is only utilizing 2 Gigabytes for this block storage 
device. In this case we would use 20 GBs in the energy estimation formula for EBS storage. 

### Carbon Estimates (CO2e)
Once we have the estimated Watt-Hours for usage of a given cloud provider, we then convert that into estimated CO2e 
using publicly available data on emission factors for a given electricity grid based on the mix of local energy sources.
We do this based on the cloud provider datacenter region that each service is running in. 

In the United States, we use the EPA’s [eGRID2018 Summary tables](https://www.epa.gov/egrid/egrid-summary-tables) that 
provide state specific emissions rates for CO2e. Outside the US, we carboonfootprint.com’s most recent [country specific 
grid emissions factors report](https://www.carbonfootprint.com/docs/2020_07_emissions_factors_sources_for_2020_electricity_v1_3.pdf).
In the case of Singapore, we get the data from the [Energy Market Authority’s electricity grid emissions 
factors](https://www.ema.gov.sg/statistic.aspx?sta_sid=20140729MPY03nTHx2a1), as it is not included in the 
carbonfootprint.com report. 

We understand this is a rough estimated conversion as these are only averages over a given year that is pre-2020, and 
they also don’t take into account time of day. We welcome improvements to this, for example [electrictyMap 
API](https://api.electricitymap.org/) provides hourly historical and forecasted electricity emissions data for a fee. 


### Appendix: 

#### AWS processor list
Intel Xeon https://aws.amazon.com/intel/
* Intel® Xeon® Platinum 8176M
* Intel® Xeon® Scalable Processors
* 3.0 GHz Intel Xeon Platinum 8000
* Intel® Xeon® Platinum 8175M series processors
* Intel® Xeon® Platinum 8000 Series
* Intel® Xeon® Scalable Processors
* Intel E5-2686 v4 processor
* Intel Xeon E5-2686 v4 processors
* Intel® Xeon® E5-2686 v4
* Intel® Xeon® E7 8880 processors

AMD EPYC https://aws.amazon.com/ec2/amd/ 
* 1st Gen
* 2nd Gen

#### GCP processor list
Intel Xeon https://cloud.google.com/compute/docs/cpu-platforms
* Intel Xeon Scalable Processor (Skylake)	
* Intel Xeon E7 (Broadwell E7)	
* Intel Xeon E5 v4 (Broadwell E5)	
* Intel Xeon E5 v3 (Haswell)	
* Intel Xeon E5 v2 (Ivy Bridge)	
* Intel Xeon E5 (Sandy Bridge)	

AMD EPYC https://cloud.google.com/compute/docs/cpu-platforms
* AMD EPYC 2nd Gen (Rome)

© 2020 ThoughtWorks, Inc. All rights reserved.
