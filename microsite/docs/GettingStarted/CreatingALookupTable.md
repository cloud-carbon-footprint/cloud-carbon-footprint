---
id: creating-a-lookup-table
title: Creating a Lookup Table
slug: /creating-a-lookup-table
sidebar_position: 8
---

In order to support the big data processing requirements that some organizations have, it may be more practical or efficient for you to compute carbon metrics within your existing processing. To do so, we support the generation of a lookup table that can be utilized as an additional step in your pipeline.

The lookup table maps the estimated energy (kilowatt-hours) and carbon emissions (CO2e) to 1 unit of usage, for all the unique combinations of region, service name, usage type and usage unit in the billing data of your cloud provider(s).

Once generated, this lookup table (CSV file) can be deployed to your ETL or other data processing pipeline. Then when processing your billing data, you can simply multiply your usage amount by the values in the lookup tables to estimate energy and CO2e. This approach avoids having to use the Cloud Carbon Footprint application code directly, and works regardless of the programming language or environment used in your pipeline.

For each service categorization, here are the standard usage units that the lookup table results represent and how you should multiply your usage amount:

- Compute: _Hours_
- Storage: _Terabyte-hours_
- Memory: _Gigabyte-hours_
- Networking: _Gigabytes_

To generate this lookup table:

1. Make sure you have a CSV file inside the `cli` package, that contains all the unique region, service name, usage type and usage unit variations in your billing data, along with the vCPUs for that line item, if it exists. You can see an example of this using AWS data [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/cli/src/__tests__/CreateLookupTable/aws_input.test.csv), and [below](#example-queries-to-create-input-csv-file) for example queries to create this file.
1. Run the following:

```zsh
   yarn create-lookup-table <options>
```

The options for this command are:

    --awsInput <filename> (required. name of input file, e.g. "aws_input.csv")
    --awsOutput <filename> (optional, defaults to "aws_lookup_data.csv")
    --gcpInput <filename> (required. name of input file, e.g. "gcp_input.csv")
    --gcpOutput <filename> (optional, defaults to "gcp_lookup_data.csv")
    --azureInput <filename> (required. name of input file, e.g. "azure_input.csv")
    --azureOutput <filename> (optional, defaults to "azure_lookup_data.csv")

We would like to thank [@mfulleratlassian](https://github.com/mfulleratlassian) for contributing this functionality.

## Example queries to create input CSV file

### AWS - Athena Query

```sql
    SELECT
    line_item_product_code as serviceName,
    product_region as region,
    line_item_usage_type as usageType,
    pricing_unit as usageUnit,
    product_vcpu as vCpus
    FROM <your-cost-and-usage-reports-table>
    WHERE line_item_line_item_type IN ('Usage', 'DiscountedUsage', 'SavingsPlanCoveredUsage')
    AND line_item_usage_start_date >= DATE('YYYY-MM-DD')
    AND line_item_usage_start_date <= DATE('YYYY-MM-DD')
    GROUP BY 1, 2, 3, 4, 5
```

### GCP - BigQuery Query

```sql
    SELECT
    service.description as serviceName,
    ifnull(location.region, location.location) as region,
    sku.description as usageType,
    usage.unit as usageUnit,
    system_labels.value AS machineType
    FROM <your-billing-export-table>
    LEFT JOIN
    UNNEST(system_labels) AS system_labels
    ON system_labels.key = "compute.googleapis.com/machine_spec"
    WHERE cost_type != 'rounding_error'
    AND usage.unit IN ('byte-seconds', 'seconds', 'bytes')
    AND usage_start_time >= TIMESTAMP('YYYY-MM-DD')
    AND usage_end_time <= TIMESTAMP('YYYY-MM-DD')
    GROUP BY serviceName, region, usageType, usageUnit, machineType
```

### Azure - Yarn Script

Creating an input file for Azure using billing data requires the use of the Consumption Management API rather than a direct query.
To assist with this, we have created a script that makes use of your configured [credentials](docs/ConnectingData/Azure.md) in the `packages/cli/.env` file to query and output the needed mappings to a CSV file.

To use this script, run the following yarn command with the provided parameters:

    yarn create-azure-lookup <options>

The options for this command are:

    --startDate <YYYY-MM-DD> (optional, defaults to 30 days prior to endDate)
    --endDate <YYYY-MM-DD> (optional, defaults to current date)
    --output <filename> (optional, defaults to "azure_input.csv")
