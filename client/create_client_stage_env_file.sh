#!/usr/bin/env sh

#
# © 2020 ThoughtWorks, Inc. All rights reserved.
#

echo HOST_URL=$HOST_URL >> .env
echo OKTA_ORG_URL=$OKTA_ORG_URL >> .env
echo APP_SECRET=$APP_SECRET >> .env
echo OKTA_CLIENT_ID=$OKTA_CLIENT_ID >> .env
echo OKTA_CLIENT_SECRET=$OKTA_CLIENT_SECRET >> .env
echo REACT_APP_AWS_USE_BILLING_DATA="true" >> .env
echo REACT_APP_GCP_USE_BILLING_DATA="true" >> .env
