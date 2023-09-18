---
id: introduction
title: Introduction
slug: /introduction
sidebar_position: 1
---

### Running Locally

There are a few options when it comes to running the app locally.

If you are hoping to get up and running quickly, check out the [Getting Started](GettingStarted.md) for how to begin, including a command to run for a quick install. This will guide you through running the app with your data (for additional details, read on below).

If you’re not ready to connect your data, no problem - you can [run with mocked data](RunWithMockedData.md).

### Connecting your Data

A few steps are required to run the app with real data, that are different for each cloud provider. 

To make it easier to configure your app with real data, we have [Guided Install instructions](GettingStarted.md#guided-install) that you can follow.   

To manually configure your cloud provider(s), check out the steps for each cloud provider in the Connect to Real Data section:

- [AWS](docs/ConnectingData/AWS.md)
- [GCP](docs/ConnectingData/GCP.md)
- [Azure](docs/ConnectingData/Azure.md)

### Storing your Data
By default, the app uses a [local cache system](docs/ConfigurationOptions/DataPersistenceAndCaching.md#json-file) to store your estimate data as a JSON file.
For users or organizations with large amounts of services and usage, you may wish for an alternative method to persist a larger scale of data. For this case, we allow
the option to [set up and connect a MongoDB instance](docs/ConfigurationOptions/DataPersistenceAndCaching.md#mongodb-storage) as a storage method.

You can view the full range of these options and the features that come with them in the [Data Persistence and Caching](docs/ConfigurationOptions/DataPersistenceAndCaching.md) section.

If you still begin to experience performance issues, check out our [Performance Considerations](docs/ConfigurationOptions/PerformanceConsiderations.md) page for some options you can set up to improve it.

### Your Setup - Defaults and Customizations

By default, Cloud Carbon Footprint will be configured to pull data from billing data. This option allows for a holistic view of your emissions, energy and cost data over a given period of time. It will pull usage information for all services for the accounts you give it access to and then use the average cpu utilization for each cloud provider’s processors.

If you are looking to get more granular, we do have an option to configure Cloud Carbon Footprint to pull data from a select few services for AWS and GCP. For more information on this approach and how to configure it please visit the [Alternative Approaches](docs/ConnectingData/AlternativeDataApproaches.md) page.
