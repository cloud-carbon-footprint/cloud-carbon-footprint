#!/usr/bin/env sh

#
# © 2020 ThoughtWorks, Inc. All rights reserved.
#

# Requires SERVER_VERSION and CLIENT_VERSION to be set to valid tags
# for their respective image repository

set -x

gcloud --quiet app deploy \
  --image-url=gcr.io/cloud-carbon-footprint/server:${SERVER_VERSION} \
  --version=stagingflex \
  server.yaml
gcloud --quiet app deploy \
  --image-url=gcr.io/cloud-carbon-footprint/client:${CLIENT_VERSION} \
  --version=stagingflex \
  client.yaml
gcloud --quiet app deploy \
  dispatch.yaml
