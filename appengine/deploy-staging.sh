#!/usr/bin/env sh

#
# © 2021 Thoughtworks, Inc.
#

set -x

gcloud --quiet app deploy \
  --version=staging \
  ../dist-workspace/packages/api/app-staging.yaml
gcloud --quiet app deploy \
  --version=staging \
  ../dist-workspace/packages/client/app-staging.yaml
gcloud --quiet app deploy \
  dispatch.yaml
