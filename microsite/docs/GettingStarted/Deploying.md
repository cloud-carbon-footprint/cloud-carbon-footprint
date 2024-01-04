---
id: deploying
title: Deploying
slug: /deploying
sidebar_position: 9
---

## Deploy to Google App Engine
<!-- NEW Instructions -->
Cloud Carbon Footprint is able to be deployed using serverless options such as [Google App Engine](https://cloud.google.com/appengine/). To deploy to App Engine's Standard Environment, you will first have to do the following:

- Install the [gcloud CLI](https://cloud.google.com/sdk/gcloud)
- Have access to a project and service account with the [correct permissions](https://cloud.google.com/appengine/docs/standard/roles)
- Google Cloud Project with an [App Engine Application created](https://cloud.google.com/appengine/docs/standard/nodejs/building-app/creating-project#creating-a-gcp-project)

We will be deploying Cloud Carbon Footprint using App Engine's Standard Environment with Node.js. 

Deploying to App Engine will involve uploading your source files to Google Cloud Storage where your app will be deployed and built using the Cloud Build service. For this process to work, you must have Cloud Build enabled in your project and assign the `Storage Object Viewer` permission to the [Cloud Build service account](https://cloud.google.com/build/docs/securing-builds/configure-access-for-cloud-build-service-account?_ga=2.60557161.-51432.1692371347&_gac=1.159431247.1702657875.Cj0KCQiAj_CrBhD-ARIsAIiMxT-mK3AQ_yjaD9oue_os4iogaIYcHMJycA4rgav3uX3Rp6qWxed9QuUaAsYaEALw_wcB#service-account-permissions-iam-page).

Make sure to also configure your gcloud environment to target the project where you intend to deploy your App Engine services: `gcloud config set project [project-name]`

### Deploy API

1. Navigate to the `packages/api` directory of your CCF project. There will already be an `app.yaml` file configured with the App Engine runtime information for the API service. You are welcome to [modify this file](https://cloud.google.com/appengine/docs/standard/reference/app-yaml?tab=node.js) to determine your instance and other configurations.

2. Make sure you have already followed the steps to [connect your data](./GettingStartedIntro.md#connecting-your-data) and have created a `.env` with your app's configurations.

    > If fetching GCP estimates, App Engine will attempt to use the default App Engine service account assigned to your App Engine instance unless the `GOOGLE_APPLICATION_CREDENTIALS` variable is set in your `.env` file. If this is desired, make sure to assign the least permissions needed for querying your Billing Data as noted when [Connecting your Data to GCP](../ConnectingData/GCP.md).

3. The default App Engine configuration in your `app.yaml` file sets the logging mode to use Google Cloud's [Cloud Logging](https://cloud.google.com/logging?hl=en) service to integrate CCF's logging experience with the native App Engine logger. Make sure that the service account used has permissions for [creating and writing logs](https://cloud.google.com/logging/docs/access-control#permissions_and_roles).

4. Deploying to App Engine will require building, extracting, and preparing your app to be deployed to App Engine's NodeJS environment. Fortunately, we have made a script to make these steps easier for you and to ensure that certains tools such as the yarn version used is made compatible for App Engine's build steps. You can manually execute the steps in the script or simply execute the following command in your terminal `./appengine-deploy.sh` to run the script.

    This script will do the following:

    * Build the API application
    * Copy the source files into a temporary directory
    * Copy environment variables in your `.env` file to the temp directory
    * Configure App Engine's compatible Yarn version and install dependencies
    * Deploy to App Engine using the `gcloud app deploy` command.

    > If in a linux environment and facing permission errors when executing the script, you may need to provide the script execution permissions using: `chmod -x ./appengine-deploy.sh`.

    If you wish to see a summary of the services to deploy as shown in the example below, you can manually run `gcloud app deploy` in your terminal and the gcloud util will show a preview reflecting your current configurations in your `app.yaml` file. Make sure the summary matches your desired configuration. If you intend to use the script, exit using `ctrl+c` otherwise the build will fail. If running the commands manually and have already executed the steps above, you can hit `enter` to confirm and begin the deployment.

    ``` sh
    Services to deploy:

    descriptor:                  [/home/cloud-carbon-footprint/packages/api/app.yaml]
    source:                      [/home/cloud-carbon-footprint/packages/api]
    target project:              [cloud-carbon-footprint]
    target service:              [default]
    target version:              [20231215t144836]
    target url:                  [https://api-dot-cloud-carbon-footprint.ue.r.appspot.com]
    target service account:      [cloud-carbon-footprint@appspot.gserviceaccount.com]
    ```
    
    > If running manually, you can use the `--version` flag to specify a specific version ID for your deployment. Otherwise, a timestamp-based one will be generated as shown in the example.

5. Google Cloud will begin building your application and deploying it to app engine. When it is finished, the link to your deployed service will be provided or you can access it by running the `gcloud app browse` command. If no custom routing is configured, it will deploy to `https://[version]-dot-[project-name].[region].r.appspot.com`.

By default, secrets stored in your local `.env` file will be deployed to your App Engine instance. If you wish to have a more robust solution for managing your secrets within Google Cloud, you can store your secrets by adding your variables to the `app.yaml` file's `env_variable` section, or check out [other Google Cloud Secret Management solutions](https://cloud.google.com/secret-manager/docs/overview#choosing_a_secret_management_solution).

<!-- Old Instructions Below -->

### Deploying with Github Actions
Cloud Carbon Footprint is also configured to be deployed to [Google App Engine](https://cloud.google.com/appengine/) (standard environment) using GitHub Actions. See the [Hello World example](https://cloud.google.com/nodejs/getting-started/hello-world) for instructions on setting up a Google Cloud Platform project and installing the Google Cloud SDK to your local machine.

Before deploying, you'll need to build the application and create the packages/api/.env and packages/client/.env file as mentioned above and in our [Getting Started](./GettingStartedIntro.md) section. There are two scripts to populate these files as part of the GitHub Actions pipeline: [packages/cli/create_server_env_file.sh](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/api/create_server_env_file.sh) and [client/create_client_env_file.sh](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/client/create_client_env_file.sh).

Once you've set up the CGP project and have the command line tools, Cloud Carbon Footprint can be deployed with `./appengine/deploy-staging.sh` or `./appengine/deploy-production.sh`, depending on your environment.

Or if you want to use GitHub Actions, you can see the configuration for this in [.github/workflows/ci.yml](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/.github/workflows/ci.yml).

It will deploy to `https://<something>.appspot.com`.

## Deploy to AWS

The application can also be deployed in AWS by making use of EC2 as the compute service to run it on. In order to do so, we provide a basic infrastructure setup that spins up all the necessary cloud resources, from the required role/policies to the actual compute resource and its provisioning (EC2 with user data).

The infrastructure setup, developed with Terraform, can be found in `terraform/aws` and needs to be parametrized with the right values and tweaked to the specific circumstances of the user i.e. there might not be the need to fire up all resources but a subset of them.

For more information, please note that there are specific instructions for this [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/terraform/aws/README.md).

## Deploy to other cloud providers

Cloud Carbon Footprint should be deployable to other cloud providers such as [Heroku](https://www.heroku.com/) or [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/). However, only Google App Engine has been tested currently, so there may be some work involved in doing this.

Don't forget to deploy your `.env` files or otherwise set the environment variables in your deployment.
