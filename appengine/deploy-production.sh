#!/usr/bin/env sh

#
# © 2021 ThoughtWorks, Inc.
#

set -x

gcloud --quiet app deploy \
  --version=production \
  ../packages/api/app-production.yaml
gcloud --quiet app deploy \
  --version=production \
  ../packages/client/app-production.yaml
gcloud --quiet app deploy \
  dispatch.yaml
