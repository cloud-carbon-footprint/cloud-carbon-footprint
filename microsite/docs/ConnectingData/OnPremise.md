---
id: on-premise
title: On-Premise
slug: /on-premise
sidebar_position: 4
---

## Summary

### Custom Data Model

As more organizations consider moving to the cloud, energy consumption and CO2e emissions associated with the migration from on-premise or co-located data centers should be taken into consideration. Oftentimes, unless the organization provides a sophisticated server measuring software, it can be difficult to measure the energy consumption over a given time period. With much analysis and collaborative efforts with CCF open source contributors, we have created a methodology to measure both energy consumption and CO2e emissions associated with on-premise physical server usage.

As on-premise consumption tends to vary significantly across organizations, we have decided to implement a generic data model to be used as an input to CCF. [Here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/cli/src/__tests__/EstimateOnPremiseData/on_premise_data_input.test.csv) is a sample CSV file with the data model necessary to be consumed by CCF. This is currently the minimum amount of data needed to make our calculations.

CSV Data Model:

| Name | Type | Description |
| --------- | --------- | ----------- |
| cpuDescription | string | Central processing unit description |
| memory | number | Number of gigabytes of memory usage |
| machineType | string | Machine type (Ie. server, laptop, desktop) |
| startTime | Date | Timestamp recording the start day/time of usage |
| endTime | Date | Timestamp recording end day/time of usage |
| country | string | Country where server was located |
| region | string | Region or state within country server was located |
| machineName? | string | Physical host name |
| cost? | number | The amount of cost associated with each row |
| cpuUtilization? | number | Specific server utilization percentage (Ie. 50% = 50) |
| powerUsageEffectiveness? | number | Power usage effectiveness for data center |
| dailyUptime | number | Active usage hours in the last day |
| weeklyUptime | number | Active usage hours in the last week |
| monthlyUptime | number | Active usage hours in the last month |
| annualUptime | number | Active usage hours in the last year |

You will see via the `machineType` column that our application supports both on-premise servers from data centers, as well as laptop and desktop devices. We have found that when considering a cloud migration, some organizations may see a change in energy/carbon emissions if they begin running laptop or desktop workloads via cloud-hosted workstations instead. Adding any other supported machine types can be easily configured into the application.

This data model currently requires up-time figures per day, week, month and year. The purpose is to be able to calculate the associated emissions and energy usage with the time a server is active in the given time frame. To determine these values, it is recommended to set up an incremental aggregator that adds hours to each given up-time value when a server is active, and reset the value each day/week/month/year depending on the up-time key.


### Methodology

Based on our analysis to date, CCF is currently only able to make on-premise estimations for Compute and Memory usage. We welcome any insight and collaboration to determine estimations for other usage types such as Storage or Networking. Currently, only these operational emissions are supported. In the future, we hope to incorporate embodied emissions for on-premise as well.

Our application parses the provided input CSV file and is able to iterate over each row through the same Compute and Memory formulas laid out in the main [Methodology](docs/HowItWorks/Methodology.md). It is able to map the machineName column to the associated microarchitecture and leverage the SpecPower Database to determine average compute and memory coefficients, like min/max watts and memory (GB), similar to how we grab these values for cloud providers.

The main differences for the on-premise methodology are:

- Instead of using Virtual CPU Hours in the formula, we use CPU hours as the input data which concerns entire physical machines. We also provide some configuration options for various machine types that you can see below.
- The average PUE defaults to 1.58, based on this [Uptime Institute Report](https://journal.uptimeinstitute.com/data-center-pues-flat-since-2013/).


Note:
*Unless there is a cpuUtilization value provided for each row in the input data, it is difficult to determine an accurate average utilization value used broadly across on-premise data centers. For now, we will continue to default to the projected estimate for the average server utilization of servers in hyperscale data centers in 2020 of 50%, from the [2016 U.S. Data Center Energy Usage Report](https://eta.lbl.gov/publications/united-states-data-center-energy).*


### Configuration Options

We have implemented custom configuration options to help on-premise consumers calculate more accurate estimations specific to their usage and available data rather than always relying on CCF averages and default values.

The publicly available data from SpecPower Database that we rely on for the average or median min/max wattage values is only truly reliable when considering a full server. Since these values will likely differ significantly for laptop and desktop computers, we offer an option to configure a custom CPU Utilization value to use with the CCF default average watts based on SpecPower min/max watts, or instead, configure a custom Average Watts value per machine type to override the defaults.

Set in the `packages/cli/.env` file, here is an example of how you would set the custom configurable values:

```
ON_PREMISE?: {
    SERVER?: {
        CPU_UTILIZATION?: number
        AVERAGE_WATTS?: number
    }
    LAPTOP?: {
        CPU_UTILIZATION?: number
        AVERAGE_WATTS?: number
    }
    DESKTOP?: {
        CPU_UTILIZATION?: number
        AVERAGE_WATTS?: number
    }
}
```
You can also view these configurations in more detail in our [Configurations Glossary](docs/ConfigurationOptions/ConfigurationsGlossary.md#optionally-set-these-custom-configurations-for-on-premise-calculations).

### Accessing the Data

Currently, the CCF application only supports reading and writing to a CSV for measuring on-premise usage. In order to use our data model to calculate energy consumption and CO2e emissions associated with your on-premise usage, you must add your CSV file directly into the `packages/cli` directory. The CSV format must match the columns laid out in our data model. Otherwise, the data will not be able to be consumed by CCF.

In your terminal, run the following command from the application root directory:

`yarn run estimate-on-premise-data --onPremiseInput [<Input File Name>]`

You can optionally add the argument `--onPremiseOutput [<Output File Name>]` to specify the name of the output file which includes the same data from the input file as well as kilowattHours and co2e for each up-time increment appended as new columns.
