---
id: embodied-emissions
title: Embodied Emissions
slug: /embodied-emissions
sidebar_position: 2
---

Embodied Carbon Emissions or [Embedded Emissions](https://en.wikipedia.org/wiki/Embedded_emissions) is the amount of carbon emitted during the creation and disposal of a hardware device. In order to estimate embodied emissions in the cloud, we need to calculate the fraction of the total embodied emissions that should be allocated to your particular amount of usage or workload. For example, if you are only utilizing a subset of virtual CPUs that are available on a given physical server, then we need to allocate a relative amount of embodied emissions to represent this.

Recently, the Green Software Foundation (GSF) released the first version of the [Software Carbon Intensity (SCI) Specification (v.Alpha)](https://github.com/Green-Software-Foundation/software_carbon_intensity), which defines a methodology for calculating the rate of carbon emissions for a software system. While it is on our roadmap to more broadly adhere to the SCI standard, for the purpose of estimating embodied emissions, we have leveraged a particular part of specification. In addition, we have leveraged [research published](https://medium.com/teads-engineering/building-an-aws-ec2-carbon-emissions-dataset-3f0fd76c98ac) by Teads and [@github-benjamin-davy](https://github.com/github-benjamin-davy) in order to apply this to AWS, GCP and Azure.

In our implementation, we leverage this formula provided by the SCI standard:

`M = TE * (TR/EL) * (RR/TR)`

Where:

`TE = Total Embodied Emissions, the sum of Life Cycle Assessment(LCA) emissions for all hardware components`<br />`TR = Time Reserved, the length of time the hardware is reserved for use by the software`<br />`EL = Expected Lifespan, the anticipated time that the equipment will be installed`<br />`RR = Resources Reserved, the number of resources reserved for use by the software.`<br />`TR = Total Resources, the total number of resources available.`

In order to get **TE** for each specified hardware per cloud provider, we leveraged section 5 of the methodology presented in the Teads Engineering article [“Building an AWS EC2 Carbon Emissions Dataset”](https://medium.com/teads-engineering/building-an-aws-ec2-carbon-emissions-dataset-3f0fd76c98ac) by Benjamin Davy, to estimate the manufacturing emissions for each hardware. In the case of AWS, we directly use the total embodied emissions calculated by the Teads team as they have gathered additional information about the underlying hardware provisioned for each instance type. For GCP and Azure, we have calculated the total embodied emissions using the underlying microarchitecture or microarchitectures that could be used for a given instance or machine type. We welcome any contributions to help us gain further accuracy like AWS, which we believe should be possible at least in the case of Azure. We have published this embodied emissions data in [this spreadsheet](https://docs.google.com/spreadsheets/d/1k-6JtneEu4E9pXQ9QMCXAfyntNJl8MnV2YzO4aKHh-0/edit?usp=sharing), and will be using the Cloud Carbon Footprint [ccf-coefficients repository](https://github.com/cloud-carbon-footprint/cloud-carbon-coefficients) as a library of the most up to date embodied emissions data for each cloud provider.

The Teads Engineering article mentioned above is from **September 2021**—it is outdated as a sole reference (older instance catalog and assumptions). This line of research embedded into the [Boavizta](https://boavizta.org/) organization and continues there. 
The “Total Platform Scope 3 Emissions (kgCO₂eq)” can be successfully derived from the [Boavizta API](https://api.boavizta.org/docs).  To obtain the Scope 3 emissions, the following procedure is followed:

1. **Identify the platform archetype:** Query the /v1/cloud/instance/instance_config endpoint for the specific instance (e.g., a1.medium). The response includes a **platform** field naming the physical archetype (e.g., a1.metal). You call this endpoint with the cloud provider and instance identifier you need to resolve.
2. **Query the server endpoint:** Use the identified platform archetype to query the /v1/server endpoint. This provides the unallocated, total impact of the physical host (lifecycle-style server record for that platform).
3. **Extract the embedded GWP:** From the server response, use **impacts.gwp.embedded.value**. This represents the total manufacturing / Scope 3 impact of the platform.

For a recent refresh of AWS and GCP embodied inputs we used Boavizta API endpoints only outside the application and consolidated values in [this spreadsheet](https://docs.google.com/spreadsheets/d/19BCiLfB0rtpFSAaXCl0UKhDdhwYYiiEaxPrra-hMSk4/edit?usp=sharing) and will be using the Cloud Carbon Footprint. Azure still follows the microarchitecture-based approach above for now.

For **TR (time reserved)** we used the amount of time a given compute instance was running for.

For **EL** we use 4 years, which is the same number chosen by the Teads team, based on the Dell PowerEdge R740 [Full Life Cycle Assessment](https://www.delltechnologies.com/asset/en-us/products/servers/technical-support/Full_LCA_Dell_R740.pdf).

For **RR**, we use the number of vCPUs of the given instance.

For **TR (total resources)**, we use the largest instance vCPUs for the given family. In the case of burstable (AWS) or Shared-Core (AWS) families, we use the largest instance in the closest family, as this is more accurate than using the largest in the burstable/Shared-Core families. For the Azure Constrained vCPUs capable instances, we use the underlying vCPUs of each instance as the largest vCPU, as this is our current reading of the documentation on their website.

At this moment, we only include Embodied Emissions for the Compute usage types for all the cloud providers we support, but welcome any contributions to apply embodied emissions to other types of cloud usage.
 
