---
id: deploying
title: Deploying
---

### Deploy to Google App Engine

Cloud Carbon Footprint is configured to be deployed to [Google App Engine](https://cloud.google.com/appengine/) (standard environment) using Github Actions. See the [Hello World example](https://cloud.google.com/nodejs/getting-started/hello-world) for instructions on setting up a Google Cloud Platform project and installing the Google Cloud SDK to your local machine.

Before deploying, you'll need to build the application and create the packages/api/.env and packages/client/.env file as detailed above. There are two scripts to populate these files as part of the Github Actions pipeline: [packages/cli/create_server_env_file.sh](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/api/create_server_env_file.sh) and [client/create_client_env_file.sh](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/client/create_client_env_file.sh).

Once you've set up the CGP project and have the command line tools, Cloud Carbon Footprint can be deployed with `./appengine/deploy-staging.sh` or `./appengine/deploy-production.sh`, depending on your environment.

Or if you want to use Github Actions, you can see the configuration for this in [.github/workflows/ci.yml](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/.github/workflows/ci.yml).

It will deploy to `https://<something>.appspot.com`.

## Deploy to other cloud providers

Cloud Carbon Footprint should be deployable to other cloud providers such as [Heroku](https://www.heroku.com/) or [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/). However only Google App Engine has been tested currently, so there may be some work involved in doing this.

Don't forget to deploy your `.env` files or otherwise set the environment variables in your deployment.
