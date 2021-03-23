---
id: deploying
title: Deploying
---

### Deploy to Google App Engine

Cloud Carbon Footprint is configured to be deployed to [Google App Engine](https://cloud.google.com/appengine/) (standard environment) using Circle CI. See the [Hello World example](https://cloud.google.com/nodejs/getting-started/hello-world) for instructions on setting up a Google Cloud Platform project and installing the Google Cloud SDK to your local machine.

Before deploying, you'll need to build the application and create the packages/api/.env and packages/client/.env file as detailed above. There are two scripts to populate these files as part of the Circle CI pipeline: [packages/cli/create_server_env_file.sh](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/api/create_server_env_file.sh) and [client/create_client_env_file.sh](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/client/create_client_env_file.sh).

Once you've set up the CGP project and have the command line tools, Cloud Carbon Footprint can be deployed with `./appengine/deploy-staging.sh` or `./appengine/deploy-production.sh`, depending on your environment.

Or if you want to use CircleCI, you can see the configuration for this in [.circleci/config.yml](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/.circleci/config.yml).

It will deploy to `https://<something>.appspot.com`.

If you don't want to deploy the client application behind Okta, then the packages/client/.env file is not needed, and the relevant code can be removed from [client/index.js](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/client/index.js).

### Deploy to other cloud providers

Cloud Carbon Footprint should be deployable to other cloud providers such as [Heroku](https://www.heroku.com/) or [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/). However only Google App Engine has been tested currently, so there may be some work involved in doing this.

Don't forget to deploy your .env file or otherwise set the environment variables in your deployment.
