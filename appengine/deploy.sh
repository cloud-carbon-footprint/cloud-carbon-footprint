#!/usr/bin/env sh

#
# © 2020 ThoughtWorks, Inc. All rights reserved.
#

set -x

gcloud --quiet app deploy \
  --version=staging \
  ../server/app.yaml
gcloud --quiet app deploy \
  --version=staging \
  ../client/app.yaml
gcloud --quiet app deploy \
  dispatch.yaml
