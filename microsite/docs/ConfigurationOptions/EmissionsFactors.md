---
id: emissions-factors
title: Emissions Factors
slug: /emissions-factors
sidebar_position: 5
---

## Carbon Intensity Emissions Factors

Carbon Intensity Emissions Factors are values that represent the amount of carbon dioxide equivalent (CO2e) emissions produced per unit of energy consumed. These factors vary depending on factors like energy source and geographical region. CCF utilizes these factors to estimate emissions associated with cloud infrastructure energy consumption.
We provide more detailed information in our [methodology](https://www.cloudcarbonfootprint.org/docs/methodology#carbon-estimates-co2e) on how the tool uses carbon intensity emissions factors and how the defaults are sourced.

### Default Emissions Factors

CCF comes with a set of default emissions factors that are sourced from publicly available data sources such as government agencies, energy organizations, and research institutions. These default factors provide a reasonable estimate of carbon intensity for different energy sources and regions and are used when no specific configuration is provided.
For reference, we have the default grid emissions factors located [here](https://www.cloudcarbonfootprint.org/docs/methodology#appendix-v-grid-emissions-factors) in the appendix of the Methodology.


### Electricity Maps API Configuration

CCF offers the flexibility to configure the tool to use the Electricity Maps API for obtaining daily carbon intensity factors per region across various cloud providers. This allows for more accurate and up-to-date emissions estimations based on real-time data.

Here's how to configure CCF to use the Electricity Maps API:

1. **Obtain API Access**: First, you will need to obtain access to the Electricity Maps API. You can typically do this by signing up for an API token on the [Electricity Maps website](https://www.electricitymaps.com/get-our-data).

2. **Configuration File**: Open the CCF configuration file. This file is typically named `.env`, either located in the `api` or `cli` packages, and it is where you specify various settings for CCF. You can also refer to our [Configurations Glossary](https://www.cloudcarbonfootprint.org/docs/configurations-glossary#optionally-set-electricity-maps-api-token).

3. **API Key Configuration**: In the configuration file, create a new environment variable called `ELECTRICTY_MAP_TOKEN`, and set your token as the value.


   ```yaml
   # Example CCF Configuration File
   
     # Configuration for Electricity Maps API
     ELECTRICTY_MAPS_TOKEN=your-token-here 
   ```
    
4. **Run CCF**: Once you have configured CCF to use the Electricity Maps API, you can run the tool as you normally would. CCF will now use the Electricity Maps API to obtain carbon intensity factors for each region.

### Additional Notes

- If you do not have access to the Electricity Maps API, you can still use CCF with the default emissions factors. Simply do not configure the tool to use the Electricity Maps API, and it will use the default factors instead.
- If the API request fails, or is unable to map a given cloud region to Electricity Maps zone, then the app will fall back to the default emissions factors.
- For more information on the Electricity Maps API, please visit the [Electricity Maps API Documentation](https://static.electricitymaps.com/api/docs/index.html).