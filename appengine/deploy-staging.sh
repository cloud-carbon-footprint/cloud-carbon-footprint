#!/usr/bin/env sh

#
# © 2021 Thoughtworks, Inc. All rights reserved.
#

set -x

gcloud --quiet app deploy \
  --version=staging \
  ../packages/api/app-staging.yaml
gcloud --quiet app deploy \
  --version=staging \
  ../packages/client/app-staging.yaml
gcloud --quiet app deploy \
  dispatch.yaml
