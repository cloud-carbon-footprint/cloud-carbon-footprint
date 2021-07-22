#!/usr/bin/env sh

#
# © 2021 Thoughtworks, Inc.
#

set -x

gcloud --quiet app deploy \
  --version=production \
  ../dist-workspace/packages/api/app-production.yaml
gcloud --quiet app deploy \
  --version=production \
  ../dist-workspace/packages/client/app-production.yaml
gcloud --quiet app deploy \
  dispatch.yaml
