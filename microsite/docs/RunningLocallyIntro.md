---
id: introduction
title: Introduction
---

When running the app locally, first choose if you would like to run with mocked data or connect to your cloud data.

### Connecting your Data

A few steps are required to run the app with real data, that are different for each cloud provider. Check out the steps for each cloud provider in the Connect to Real Data section:

- [AWS](aws)
- [GCP](gcp)
- [Azure](azure)

If you have a lot of data and begin to experience performance issues, check out our [Performance Configurations](performance-configurations) page for some options you can set up to improve it.

### Your Setup - Defaults and Customizations

By default, Cloud Carbon Footprint will be configured to pull data from billing data. This option allows for a holistic view of your emissions, energy and cost data over a given period of time. It will pull usage information for all services for the accounts you give it access to and then use the average cpu utilization for each cloud provider’s processors.

If you are looking to get more granular, we do have an option to configure Cloud Carbon Footprint to pull data from a select few services for AWS and GCP. For more information on this approach and how to configure it please visit the [Alternative Approaches](alternative-data-approaches) page.
