---
id: deploying
title: Deploying
slug: /deploying
sidebar_position: 8
---

### Deploy to Google App Engine

Cloud Carbon Footprint is configured to be deployed to [Google App Engine](https://cloud.google.com/appengine/) (standard environment) using GitHub Actions. See the [Hello World example](https://cloud.google.com/nodejs/getting-started/hello-world) for instructions on setting up a Google Cloud Platform project and installing the Google Cloud SDK to your local machine.

Before deploying, you'll need to build the application and create the packages/api/.env and packages/client/.env file as detailed above. There are two scripts to populate these files as part of the GitHub Actions pipeline: [packages/cli/create_server_env_file.sh](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/api/create_server_env_file.sh) and [client/create_client_env_file.sh](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/client/create_client_env_file.sh).

Once you've set up the CGP project and have the command line tools, Cloud Carbon Footprint can be deployed with `./appengine/deploy-staging.sh` or `./appengine/deploy-production.sh`, depending on your environment.

Or if you want to use GitHub Actions, you can see the configuration for this in [.github/workflows/ci.yml](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/.github/workflows/ci.yml).

It will deploy to `https://<something>.appspot.com`.

### Deploy to AWS

The application can also be deployed in AWS by making use of EC2 as the compute service to run it on. In order to do so, we provide a basic infrastructure setup that spins up all the necessary cloud resources, from the required role/policies to the actual compute resource and its provisioning (EC2 with user data).

The infrastructure setup, developed with Terraform, can be found in `terraform/aws` and needs to be parametrized with the right values and tweaked to the specific circumstances of the user i.e. there might not be the need to fire up all resources but a subset of them.

For more information, please note that there are specific instructions for this [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/terraform/aws/README.md).

## Deploy to other cloud providers

Cloud Carbon Footprint should be deployable to other cloud providers such as [Heroku](https://www.heroku.com/) or [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/). However, only Google App Engine has been tested currently, so there may be some work involved in doing this.

Don't forget to deploy your `.env` files or otherwise set the environment variables in your deployment.
