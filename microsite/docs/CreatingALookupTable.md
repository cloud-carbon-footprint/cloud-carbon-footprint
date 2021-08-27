---
id: creating-a-lookup-table
title: Creating a Lookup Table
---

In order to support the big data processing requirements that some organizations have, it may be more practical or efficient for you to compute carbon metrics within your existing processing. To do so, we support the generation of a look up table that can be utilized as an additional step in your pipeline.

The lookup table maps the estimated energy (kilowatt hours) and carbon emissions (CO2e) to 1 unit of usage, for all the unique combinations of region, service name, usage type and usage unit in the billing data of your cloud provider(s).

Once generated, this lookup table (CSV file) can be deployed to your ETL or other data processing pipeline. Then when processing your billing data, you can simply multiply your usage amount by the values in the lookup tables to estimate energy and CO2e. This approach avoids having to use the Cloud Carbon Footprint application code directly, and works regardless of the programming language or environment used in your pipeline.

To generate this lookup table:

1. Make sure you have a CSV file inside the `cli` package, that contains all the unique region, service name, usage type and usage unit variations in your billing data, along with the vCPUs for that line item, if it exists. You can see an example of this using AWS data [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/cli/src/__tests__/CreateLookupTable/aws_input.test.csv), and [below](#example-queries-to-create-input-csv-file) for example queries to create this file.
1. Run the following:
   

    yarn create-lookup-table <options>

The options for this command are:

    --awsInput <filename> (required. name of input file, e.g. "aws_input.cvs")
    --awsOutput <filename> (optional, defaults to "aws_lookup_data.csv")

Currently, only AWS is supported for this functionality.


We would like to thank [@mfulleratlassian](https://github.com/mfulleratlassian) for contributing this functionality.

## Example queries to create input CSV file

### AWS - Athena Query

    SELECT 
    line_item_product_code as serviceName,
    product_region as region,
    line_item_usage_type as usageType,
    pricing_unit as usageUnit,
    product_vcpu as vCpus
    FROM <your-cost-and-usage-reports-table>
    WHERE line_item_line_item_type NOT IN ('Usage', 'DiscountedUsage', 'SavingsPlanCoveredUsage')
    AND line_item_usage_start_date >= DATE('YYYY-MM-DD')
    AND line_item_usage_start_date <= DATE('YYYY-MM-DD')
    GROUP BY 1, 2, 3, 4, 5

