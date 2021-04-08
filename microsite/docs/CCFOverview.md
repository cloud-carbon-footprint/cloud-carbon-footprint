---
id: overview
title: Overview
---

Cloud Carbon Footprint provides a way for organizations to measure, monitor, and reduce their carbon emissions from the cloud. It supports connecting to multiple cloud providers, allowing you to get a full picture of your cloud emissions.

### Vision

The vision for this product is to be a trusted tool for its accuracy and comprehensiveness, and aids organizations to take tangible steps towards reducing their cloud emissions. In its future, we see built-in intelligence to make recommendations on actions that can be taken and what impact they will have.

As an open source project, we hope that its evolution and direction is community driven and meets the needs and use cases identified. We welcome all feedback and input on how this product can grow, in terms of directions, features, methodology changes, and code updates.  
For more visibility into the work planned and happening, please visit the [project board](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/projects/1) or [create an issue.](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/issues/new/choose)  
For feedback, questions, or if you’d like to collaborate on shaping the product direction, please reach out to green-cloud@thoughtworks.com.

### How it works

Cloud Carbon Footprint works by taking your cloud provider usage data, converting it into energy, and then taking into account the power usage effectiveness of the cloud provider’s data centers and the carbon intensity of the region where the data center pulls power from.  
For a more detailed and in depth explanation into the approach and methodology, please reference the [Methodology Page.](methodology)

### Fitting Cloud Carbon Footprint to your needs

The code has been written using domain driven design, to allow for easy extension and customization. With the core estimation logic, API, front-end dashboard, and CLI separated, it is possible to fit it to your needs, for instance using the core logic or API within an existing application, or displaying the dashboard within an existing dev portal.

### Trying it out

We have provided a few ways for you to get up and running, depending on your situation. To simply test out Cloud Carbon Footprint quickly, we have provided a few packages that can help you quickly spin up the whole app or the portion(s) you need. To test drive, visit the [Try Now](getting-started) page.

If you are looking to run the app locally or to contribute, we recommend [running the app locally](introduction). With this approach you can also get up and [running quickly with mocked data](run-with-mocked-data) or go ahead and [connect your own cloud data](aws) and estimate your actual emissions.
