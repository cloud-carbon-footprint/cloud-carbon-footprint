#!/usr/bin/env sh

#
# © 2020 ThoughtWorks, Inc. All rights reserved.
#

set -x

gcloud --quiet app deploy \
  --version=staging \
  ../packages/server/app-staging.yaml
gcloud --quiet app deploy \
  --version=staging \
  ../packages/client/app-staging.yaml
gcloud --quiet app deploy \
  dispatch.yaml
