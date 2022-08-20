Title: Billing Data OpFeature Flag for Cloud Carbon Estimation
Decision:
    - Add a feature flag "USE_AWS_BILLING_DATA" that pulls usage information from AWS Cost and Usage Reports instead of CloudWatch and Cost Explorer APIs
    - Add a feature flag "USE_GCP_BILLING_DATA" that pulls usage information from GCP Billing Export Table instead of the Cloud Monitoring API
Context:
    - The previous appraoch would loop through cloud provider accounts, regions and services individually to pull data and estimate energy/carbon usage.
    - This requires your to configure all your cloud provider accounts, as well as ensure all services are implemented.
    - This new approach, using cloud provider billing data, allows for a more holistic estimation of cloud energy and carbon usage as it pulls data for all regions and services by default.
Consequences:
    - This billing data approach doesn't use actual CPU Utilization, but a predefined constants AVG_CPU_UTILIZATION_2020. This may make it less acurate.
    - New permissions and environment variables are needed to be set for this billing data appriach to work.
