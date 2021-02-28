#!/usr/bin/env sh

#
# © 2020 ThoughtWorks, Inc. All rights reserved.
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
