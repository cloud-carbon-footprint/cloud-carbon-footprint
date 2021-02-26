#!/bin/bash

#
# © 2020 ThoughtWorks, Inc. All rights reserved.
#

rm .env
echo HOST_URL=$PROD_HOST_URL >> .env
echo OKTA_ORG_URL=$PROD_OKTA_ORG_URL >> .env
echo APP_SECRET=$PROD_APP_SECRET >> .env
echo OKTA_CLIENT_ID=$PROD_OKTA_CLIENT_ID >> .env
echo OKTA_CLIENT_SECRET=$PROD_OKTA_CLIENT_SECRET >> .env
